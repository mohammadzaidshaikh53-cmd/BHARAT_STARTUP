'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { fetchPersonalizedFeed } from '@/lib/feed/feedClient';
import { useInView } from 'react-intersection-observer';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/common/Avatar';

const PAGE_SIZE = 12;
const PREFETCH_THRESHOLD = 0.7;
const BOOST_DECAY_INTERVAL_MS = 60000;
const BOOST_DECAY_FACTOR = 0.88;

const VALID_FILTERS = [
  'all',
  'blog',
  'idea',
  'question',
  'discussion',
  'biography',
  'motivation',
];

const TYPE_ALIASES = {
  post: 'blog',
  blog: 'blog',
  idea: 'idea',
  question: 'question',
  discussion: 'discussion',
  motivation: 'motivation',
  biography: 'biography',
};

function isValidFilter(value) {
  return VALID_FILTERS.includes(value);
}

function resolveContentType(item) {
  const raw = String(
    item?.content_type || item?.item_type || item?.feed_type || item?.content_kind || ''
  )
    .toLowerCase()
    .trim();

  if (raw && TYPE_ALIASES[raw]) return TYPE_ALIASES[raw];

  const itemId = String(item?.item_id || item?.original_id || '');

  if (itemId.startsWith('q_')) return 'question';
  if (itemId.startsWith('d_')) return 'discussion';

  return 'blog';
}

function normalizeFeedItem(item) {
  if (!item || typeof item !== 'object') return null;

  const itemId = item.item_id ?? item.id ?? item.original_id ?? null;
  if (!itemId) return null;

  return {
    item_id: itemId,
    item_type: item.item_type ?? item.type ?? item.content_type ?? 'post',
    title: item.title ?? '',
    summary: item.summary ?? '',
    author_id: item.author_id ?? null,
    author_name: item.author_name ?? 'Anonymous',
    created_at: item.created_at ?? null,
    likes: item.likes ?? 0,
    replies: item.replies ?? 0,
    engagement_score: item.engagement_score ?? 0,
    content_type: item.content_type ?? item.type ?? item.item_type ?? 'blog',
    original_id: item.original_id ?? item.id ?? null,
    personalized_score: item.personalized_score ?? item.score ?? 0,
    tags: item.tags ?? [],
    slug: item.slug ?? null,
  };
}

function normalizeFeedResponse(payload) {
  if (Array.isArray(payload)) {
    return {
      items: payload.map(normalizeFeedItem).filter(Boolean),
      nextCursor: null,
    };
  }

  if (payload && Array.isArray(payload.items)) {
    return {
      items: payload.items.map(normalizeFeedItem).filter(Boolean),
      nextCursor: payload.nextCursor ?? null,
    };
  }

  return { items: [], nextCursor: null };
}

// =============================================================================
// Content Type Config
// =============================================================================
const CONTENT_CONFIG = {
  blog: {
    label: 'Blog',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    icon: '📝',
    route: (item) => `/blog/${item.slug || item.original_id || item.item_id}`,
  },
  idea: {
    label: 'Idea',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    icon: '💡',
    route: (item) => `/ideas/${item.slug || item.original_id || item.item_id}`,
  },
  question: {
    label: 'Q&A',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    icon: '❓',
    route: (item) => `/qa/${item.slug || item.original_id || item.item_id}`,
  },
  discussion: {
    label: 'Discussion',
    color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    icon: '💬',
    route: (item) => `/discussions/${item.slug || item.original_id || item.item_id}`,
  },
  motivation: {
    label: 'Motivation',
    color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    icon: '🔥',
    route: (item) => `/motivation/${item.slug || item.original_id || item.item_id}`,
  },
  biography: {
    label: 'Biography',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    icon: '👤',
    route: (item) => `/biographies/${item.slug || item.original_id || item.item_id}`,
  },
};

const CREATE_ROUTES = {
  all: '/create',
  blog: '/blog/new',
  idea: '/ideas/new',
  question: '/qa/new',
  discussion: '/discussions/new',
  biography: '/biographies/new',
  motivation: '/motivation/new',
};

function getContentConfig(item) {
  const type = resolveContentType(item);
  return CONTENT_CONFIG[type] || CONTENT_CONFIG.blog;
}

// =============================================================================
// useStableRef
// =============================================================================
function useStableRef(value) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}

// =============================================================================
// useCommunityFeed
// =============================================================================
function useCommunityFeed(userId) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const userIdRef = useStableRef(userId);
  const hasMoreRef = useStableRef(hasMore);
  const loadingRef = useStableRef(loading);
  const cursorRef = useRef({ score: Number.POSITIVE_INFINITY, id: null });
  const isFetchingRef = useRef(false);
  const prefetchCacheRef = useRef(null);

  const fetchPage = useCallback(async (isRefresh = false) => {
    const currentUserId = userIdRef.current;
    if (!currentUserId) return;
    if (isFetchingRef.current) return;
    if (!isRefresh && !hasMoreRef.current) return;

    isFetchingRef.current = true;
    setLoading(true);

    try {
      const cursor = isRefresh
        ? { score: Number.POSITIVE_INFINITY, id: null }
        : cursorRef.current;
      const cursorKey = `${cursor.score}_${cursor.id}`;

      let payload = null;
      if (prefetchCacheRef.current && prefetchCacheRef.current.cursorKey === cursorKey) {
        payload = prefetchCacheRef.current.payload;
        prefetchCacheRef.current = null;
      }

      if (!payload) {
        payload = await fetchPersonalizedFeed({
          userId: currentUserId,
          limit: PAGE_SIZE,
          cursorScore: cursor.score,
          cursorId: cursor.id,
          contentType: null,
        });
      }

      const { items: fetchedItems, nextCursor } = normalizeFeedResponse(payload);

      if (!Array.isArray(fetchedItems) || fetchedItems.length === 0) {
        setHasMore(false);
        return;
      }

      if (nextCursor?.score !== undefined && nextCursor?.id !== undefined) {
        cursorRef.current = { score: nextCursor.score, id: nextCursor.id };
      } else {
        const last = fetchedItems[fetchedItems.length - 1];
        if (last?.personalized_score !== undefined && last?.item_id !== undefined) {
          cursorRef.current = { score: last.personalized_score, id: last.item_id };
        }
      }

      setItems((prev) => {
        const normalized = fetchedItems.filter(Boolean);

        if (isRefresh) return normalized;

        const existingIds = new Set(prev.map((i) => i.item_id));
        return [...prev, ...normalized.filter((i) => i?.item_id && !existingIds.has(i.item_id))];
      });

      setHasMore(fetchedItems.length === PAGE_SIZE);
    } catch (err) {
      console.error('Feed fetch error:', err?.message || err);
      setError(err);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  const prefetchNextPage = useCallback(async () => {
    const currentUserId = userIdRef.current;
    if (!currentUserId || !hasMoreRef.current || isFetchingRef.current || loadingRef.current) return;

    const nextCursor = cursorRef.current;
    const cursorKey = `${nextCursor.score}_${nextCursor.id}`;
    if (prefetchCacheRef.current && prefetchCacheRef.current.cursorKey === cursorKey) return;

    try {
      const payload = await fetchPersonalizedFeed({
        userId: currentUserId,
        limit: PAGE_SIZE,
        cursorScore: nextCursor.score,
        cursorId: nextCursor.id,
        contentType: null,
      });

      const { items: fetchedItems, nextCursor: computedNextCursor } = normalizeFeedResponse(payload);

      if (Array.isArray(fetchedItems) && fetchedItems.length > 0) {
        prefetchCacheRef.current = {
          cursorKey,
          payload,
          items: fetchedItems,
          nextCursor: computedNextCursor ?? null,
        };
      }
    } catch (err) {
      console.warn('Prefetch failed:', err?.message);
    }
  }, []);

  const refresh = useCallback(() => {
    if (!userIdRef.current) return;
    setItems([]);
    cursorRef.current = { score: Number.POSITIVE_INFINITY, id: null };
    prefetchCacheRef.current = null;
    setHasMore(true);
    setError(null);
    fetchPage(true);
  }, [fetchPage]);

  useEffect(() => {
    if (userId) refresh();
  }, [userId, refresh]);

  return { items, loading, hasMore, error, fetchPage, refresh, prefetchNextPage };
}

// =============================================================================
// useSimpleEngagement
// =============================================================================
function useSimpleEngagement(userId) {
  const bufferRef = useRef([]);
  const timerRef = useRef(null);
  const userIdRef = useStableRef(userId);

  const flush = useCallback(async () => {
    if (!bufferRef.current.length || !userIdRef.current) return;
    const events = [...bufferRef.current];
    bufferRef.current = [];
    try {
      await supabase.rpc('batch_record_engagement_v3', { events });
    } catch (e) {
      // silent
    }
  }, []);

  const track = useCallback((event) => {
    if (!userIdRef.current) return;
    bufferRef.current.push({
      user_id: userIdRef.current,
      post_id: event.post_id,
      event_type: event.event_type,
      metadata: event.metadata || {},
    });

    if (bufferRef.current.length >= 20) {
      flush();
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(flush, 10000);
    }
  }, [flush]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    flush();
  }, [flush]);

  return track;
}

// =============================================================================
// useCategoryBoost
// =============================================================================
function useCategoryBoost() {
  const boostMapRef = useRef(new Map());
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      let changed = false;
      for (const [category, value] of boostMapRef.current.entries()) {
        const newValue = value * BOOST_DECAY_FACTOR;
        if (newValue < 0.001) {
          boostMapRef.current.delete(category);
        } else {
          boostMapRef.current.set(category, newValue);
        }
        changed = true;
      }
      if (changed) forceUpdate({});
    }, BOOST_DECAY_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  const boostCategory = useCallback((category) => {
    if (!category) return;
    const current = boostMapRef.current.get(category) || 0;
    boostMapRef.current.set(category, current + 0.3 + current * 0.1);
    forceUpdate({});
  }, []);

  const getBoost = useCallback((category) => {
    return boostMapRef.current.get(category) || 0;
  }, []);

  return { boostCategory, getBoost };
}

// =============================================================================
// Diversity Layer (improved)
// =============================================================================
function applyDiversity(items) {
  if (!Array.isArray(items) || items.length === 0) return items;

  const result = [];
  const deferred = [];

  for (const item of items) {
    const contentType = resolveContentType(item);
    const author = item.author_name;

    // Check last 3 items for over-representation
    let sameContentCount = 0;
    let sameAuthorCount = 0;
    const checkLength = Math.min(result.length, 3);
    for (let i = result.length - 1; i >= result.length - checkLength; i--) {
      if (resolveContentType(result[i]) === contentType) sameContentCount++;
      if (result[i].author_name === author) sameAuthorCount++;
    }

    // Enforce: at most 1 per author and at most 2 per type in last 3
    if (sameAuthorCount >= 1 || sameContentCount >= 2) {
      deferred.push(item);
    } else {
      result.push(item);
    }
  }

  // Append deferred after, preserving order as much as possible
  return [...result, ...deferred];
}

// =============================================================================
// usePostTracking (with fast skip detection)
// =============================================================================
function usePostTracking(postId, trackFn) {
  const elementRef = useRef(null);
  const stateRef = useRef({
    maxVisibleRatio: 0,
    visibleStartTime: null,
    cumulativeTime: 0,
    attentionSent: false,
    skipSent: false,
    dwellSent: false,
  });
  const trackRef = useStableRef(trackFn);
  const postIdRef = useStableRef(postId);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !trackRef.current || !postIdRef.current) return;

    const state = stateRef.current;
    let throttleTimer = null;

    const sendScrollDepth = () => {
      if (state.maxVisibleRatio > 0 && trackRef.current) {
        trackRef.current({
          post_id: postIdRef.current,
          event_type: 'scroll_depth',
          metadata: { max_visible_percent: Math.round(state.maxVisibleRatio * 100) },
        });
        state.maxVisibleRatio = 0;
      }
    };

    const throttledSend = () => {
      if (throttleTimer) return;
      throttleTimer = setTimeout(() => {
        sendScrollDepth();
        throttleTimer = null;
      }, 1000);
    };

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      const ratio = entry.intersectionRatio;

      if (ratio > state.maxVisibleRatio) {
        state.maxVisibleRatio = ratio;
        throttledSend();
      }

      if (entry.isIntersecting) {
        if (state.visibleStartTime === null) {
          state.visibleStartTime = performance.now();
        }
      } else {
        // Not intersecting anymore – calculate duration and decide on attention/skip
        if (state.visibleStartTime !== null) {
          const visibleMs = performance.now() - state.visibleStartTime;
          state.cumulativeTime += visibleMs;
          state.visibleStartTime = null;

          sendScrollDepth();

          // Fast skip detection (< 1000ms total viewed)
          if (!state.skipSent && state.cumulativeTime < 1000) {
            trackRef.current({
              post_id: postIdRef.current,
              event_type: 'fast_skip',
              metadata: { total_visible_ms: Math.round(state.cumulativeTime) },
            });
            state.skipSent = true;
          }

          // Attention detection (>= 4000ms cumulative)
          if (!state.attentionSent && state.cumulativeTime >= 4000) {
            trackRef.current({
              post_id: postIdRef.current,
              event_type: 'attention',
              metadata: { total_visible_ms: Math.round(state.cumulativeTime) },
            });
            state.attentionSent = true;
          }
        }
      }
    }, { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] });

    observer.observe(element);

    return () => {
      if (throttleTimer) clearTimeout(throttleTimer);
      observer.disconnect();

      // Finalise on unmount
      if (state.visibleStartTime !== null) {
        const finalMs = performance.now() - state.visibleStartTime;
        state.cumulativeTime += finalMs;
      }

      sendScrollDepth();

      if (!state.skipSent && state.cumulativeTime < 1000 && state.cumulativeTime > 0) {
        trackRef.current({
          post_id: postIdRef.current,
          event_type: 'fast_skip',
          metadata: { total_visible_ms: Math.round(state.cumulativeTime) },
        });
      } else if (!state.attentionSent && state.cumulativeTime >= 4000) {
        trackRef.current({
          post_id: postIdRef.current,
          event_type: 'attention',
          metadata: { total_visible_ms: Math.round(state.cumulativeTime) },
        });
      }
    };
  }, []);

  return elementRef;
}

// =============================================================================
// FeedCard
// =============================================================================
function FeedCard({ item, index, onClick, track, boostCategory }) {
  const config = getContentConfig(item);
  const href = config.route(item);
  const contentType = resolveContentType(item);
  const postId = item.original_id || item.item_id;
  const trackingRef = usePostTracking(postId, track);

  const handleClick = useCallback(() => {
    onClick?.();
    if (boostCategory && contentType) boostCategory(contentType);
  }, [onClick, boostCategory, contentType]);

  return (
    <motion.article
      ref={trackingRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.3) }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100 dark:border-gray-700"
    >
      <Link href={href} className="block" onClick={handleClick}>
        <div className="p-4 pb-0 flex items-center gap-3">
          <Avatar
            src={null}
            alt={item.author_name || 'Author'}
            fallback={item.author_name?.charAt(0) || '?'}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {item.author_name || 'Anonymous'}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${config.color}`}>
                {config.icon} {config.label}
              </span>
              <span>•</span>
              <span>{item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}</span>
            </div>
          </div>
        </div>

        <div className="p-4 pt-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {item.title}
          </h2>
          {item.summary && (
            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
              {item.summary}
            </p>
          )}
        </div>

        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-750 border-t border-gray-100 dark:border-gray-700 flex items-center gap-4 text-sm text-gray-500">
          <span>👍 {item.likes || 0}</span>
          <span>💬 {item.replies || 0}</span>
          <span className="ml-auto text-xs">Score: {item.personalized_score?.toFixed(2)}</span>
        </div>
      </Link>
    </motion.article>
  );
}

// =============================================================================
// Skeleton
// =============================================================================
function FeedSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-2xl h-48 animate-pulse border border-gray-100 dark:border-gray-700"
        />
      ))}
    </div>
  );
}

// =============================================================================
// Throttle utility
// =============================================================================
function throttle(func, delay) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

// =============================================================================
// Main Page
// =============================================================================
export default function CommunityFeedPage() {
  const [user, setUser] = useState(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeFilter, setActiveFilter] = useState(() => {
    const type = searchParams.get('type');
    return type && isValidFilter(type) ? type : 'all';
  });

  useEffect(() => {
    const type = searchParams.get('type');
    const newFilter = type && isValidFilter(type) ? type : 'all';
    if (newFilter !== activeFilter) {
      setActiveFilter(newFilter);
    }
  }, [searchParams, activeFilter]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  const userId = user?.id || null;
  const { items, loading, hasMore, error, fetchPage, refresh, prefetchNextPage } = useCommunityFeed(userId);
  const track = useSimpleEngagement(userId);
  const { boostCategory, getBoost } = useCategoryBoost();

  const hasMoreRef = useStableRef(hasMore);
  const loadingRef = useStableRef(loading);
  const userIdRef = useStableRef(userId);
  const prefetchRef = useStableRef(prefetchNextPage);

  useEffect(() => {
    const handleScroll = () => {
      if (!hasMoreRef.current || loadingRef.current || !userIdRef.current) return;
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const scrollPercent = scrollTop / docHeight;
      if (scrollPercent >= PREFETCH_THRESHOLD) {
        prefetchRef.current?.();
      }
    };

    const throttled = throttle(handleScroll, 200);
    window.addEventListener('scroll', throttled);
    return () => window.removeEventListener('scroll', throttled);
  }, []);

  const { ref: loadMoreRef, inView } = useInView({ threshold: 0.1, rootMargin: '200px' });
  const fetchRef = useStableRef(fetchPage);

  useEffect(() => {
    if (inView) {
      fetchRef.current?.();
    }
  }, [inView]);

  const processedItems = useMemo(() => {
    if (!Array.isArray(items) || items.length === 0) return [];

    const boosted = items.map((item) => ({
      ...item,
      ui_score: (item.personalized_score || 0) + getBoost(resolveContentType(item)),
    }));

    const sorted = [...boosted].sort((a, b) => (b.ui_score || 0) - (a.ui_score || 0));

    let topItems = sorted;

    // First screen optimization: only apply diversity to first 12 items
    if (items.length <= 12) {
      topItems = sorted.slice(0, 8);
    }

    const diversified = applyDiversity(topItems);

    if (activeFilter === 'all') return diversified;

    return diversified.filter((item) => resolveContentType(item) === activeFilter);
  }, [items, getBoost, activeFilter]);

  const handleCardClick = useCallback((item) => {
    track({
      post_id: item.original_id || item.item_id,
      event_type: 'click',
      metadata: {
        type: resolveContentType(item),
        score: item.personalized_score,
      },
    });
  }, [track]);

  const filters = useMemo(() => ([
    { key: 'all', label: 'All', icon: '🌐' },
    { key: 'blog', label: 'Blog', icon: '📝' },
    { key: 'idea', label: 'Ideas', icon: '💡' },
    { key: 'question', label: 'Q&A', icon: '❓' },
    { key: 'discussion', label: 'Discussions', icon: '💬' },
    { key: 'biography', label: 'Biographies', icon: '👤' },
    { key: 'motivation', label: 'Motivation', icon: '🔥' },
  ]), []);

  const createPath = CREATE_ROUTES[activeFilter] || CREATE_ROUTES.all;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      <Container className="py-6 max-w-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🏘️ Community Feed</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Discover blogs, ideas, questions, and discussions
            </p>
          </div>

          <div className="flex gap-2">
            <Link href={createPath}>
              <Button variant="primary" size="sm">
                ✍️ Create {activeFilter === 'all' ? 'Post' : (filters.find((f) => f.key === activeFilter)?.label || 'Post')}
              </Button>
            </Link>
            <Button onClick={refresh} variant="secondary" size="sm" disabled={loading}>
              {loading ? '⟳' : '🔄'} Refresh
            </Button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => {
                const url = filter.key === 'all' ? '/' : `/?type=${filter.key}`;
                router.push(url);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === filter.key
                  ? 'bg-orange-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {filter.icon} {filter.label}
            </button>
          ))}
        </div>

        {error && !loading && (
          <div className="text-center bg-red-50 dark:bg-red-500/10 p-6 rounded-2xl mb-6">
            <p className="text-red-600 dark:text-red-400">Failed to load feed.</p>
            <Button onClick={refresh} variant="secondary" size="sm" className="mt-3">
              Retry
            </Button>
          </div>
        )}

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {processedItems.map((item, idx) => (
              <FeedCard
                key={item.item_id}
                item={item}
                index={idx}
                onClick={() => handleCardClick(item)}
                track={track}
                boostCategory={boostCategory}
              />
            ))}
          </AnimatePresence>
        </div>

        {loading && processedItems.length === 0 && <FeedSkeleton count={3} />}

        {hasMore && userId && (
          <div ref={loadMoreRef} className="flex justify-center py-8">
            {loading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
            ) : (
              <span className="text-gray-400 text-sm">Scroll for more</span>
            )}
          </div>
        )}

        {!hasMore && processedItems.length > 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">✨ You&apos;re all caught up! ✨</p>
            <Button onClick={refresh} variant="ghost" size="sm">
              🔄 Explore more
            </Button>
          </div>
        )}

        {!loading && processedItems.length === 0 && !error && (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">📭</p>
            <p className="text-gray-500 dark:text-gray-400">
              {activeFilter === 'all'
                ? 'No posts yet. Be the first!'
                : `No ${activeFilter} posts found.`}
            </p>
            <Link href={createPath} className="inline-block mt-4">
              <Button variant="primary" size="sm">
                Create Post
              </Button>
            </Link>
          </div>
        )}
      </Container>
    </main>
  );
}