'use client';
// NOTE: This page is currently a full client component.
// Future improvement: extract data-fetching into a Server Component wrapper
// and keep only interactive parts (feed filters, engagement tracking) as 'use client'.
// See audit report Phase 3 for migration plan.

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
import { usePostTracking } from '@/lib/hooks/usePostTracking';

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
// Content Type Config (Futuristic Dark Mode Variants)
// =============================================================================
const CONTENT_CONFIG = {
  blog: {
    label: 'INTELLIGENCE',
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    icon: '⎔',
    route: (item) => `/blog/${item.slug || item.original_id || item.item_id}`,
  },
  idea: {
    label: 'INNOVATION',
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    icon: '✧',
    route: (item) => `/ideas/${item.slug || item.original_id || item.item_id}`,
  },
  question: {
    label: 'QUERY',
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    icon: '◈',
    route: (item) => `/qa/${item.slug || item.original_id || item.item_id}`,
  },
  discussion: {
    label: 'NETWORK',
    color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    icon: '∿',
    route: (item) => `/discussions/${item.slug || item.original_id || item.item_id}`,
  },
  motivation: {
    label: 'MOMENTUM',
    color: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    icon: '⚡',
    route: (item) => `/motivation/${item.slug || item.original_id || item.item_id}`,
  },
  biography: {
    label: 'ENTITY',
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    icon: '⌬',
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
// usePostTracking is now imported from @/lib/hooks/usePostTracking

// =============================================================================
// FeedCard
// =============================================================================
function FeedCard({ item, index, onClick, track, boostCategory }) {
  const config = getContentConfig(item);
  const href = config.route(item);
  const contentType = resolveContentType(item);
  const postId = item.original_id || item.item_id;
  const { elementRef, trackInteraction } = usePostTracking(postId, contentType, track);

  const handleClick = useCallback(() => {
    onClick?.();
    trackInteraction('click', { score: item.personalized_score });
    if (boostCategory && contentType) boostCategory(contentType);
  }, [onClick, boostCategory, contentType, trackInteraction, item.personalized_score]);

  return (
    <motion.article
      ref={elementRef}
      layout
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ 
        delay: Math.min(index * 0.05, 0.3),
        type: "spring",
        stiffness: 120,
        damping: 20
      }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="group relative bg-slate-900/60 backdrop-blur-xl rounded-xl border border-slate-800 hover:border-slate-600 transition-all duration-300 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <Link href={href} className="block relative z-10" onClick={handleClick}>
        <div className="p-5 pb-0 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-mono shadow-inner">
              {item.author_name?.charAt(0) || '⌬'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-200 tracking-wide truncate">
                {item.author_name || 'UNKNOWN_ENTITY'}
              </p>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : 'SYS_TIME_ERR'}
              </p>
            </div>
          </div>
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono tracking-widest uppercase border ${config.color}`}>
            <span>{config.icon}</span> {config.label}
          </div>
        </div>

        <div className="p-5 pt-4">
          <h2 className="text-lg font-medium text-white mb-2 leading-snug group-hover:text-indigo-300 transition-colors duration-300">
            {item.title}
          </h2>
          {item.summary && (
            <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
              {item.summary}
            </p>
          )}
        </div>

        <div className="px-5 py-3 bg-slate-950/50 border-t border-slate-800/80 flex items-center gap-6 text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-2 hover:text-slate-300 transition-colors">
            <span className="text-indigo-500">▵</span> {item.likes || 0} YIELD
          </div>
          <div className="flex items-center gap-2 hover:text-slate-300 transition-colors">
            <span className="text-cyan-500">◱</span> {item.replies || 0} NODES
          </div>
          <div className="ml-auto flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-slate-600">ACCESS LOG</span> <span className="text-slate-400">→</span>
          </div>
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
    <main className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-indigo-500/30 pb-32 relative overflow-hidden">
      {/* High-end cinematic background geometry */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120vw] h-[50vh] bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.05)_0%,rgba(0,0,0,0)_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <Container className="py-12 max-w-4xl relative z-10">
        {/* Futuristic Terminal Header */}
        <header className="mb-12 border-b border-slate-800/60 pb-8 relative">
          <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-indigo-600 rounded-full" />
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                <span className="text-[10px] font-mono tracking-[0.2em] text-cyan-500 uppercase">System Active // Global Uplink</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight mb-2">
                Ecosystem Intelligence
              </h1>
              <p className="text-slate-400 text-sm md:text-base max-w-lg font-light leading-relaxed">
                Realtime synthesis of B2B commerce signals, market demands, and verified supplier telemetry.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link href={createPath}>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono tracking-widest uppercase rounded flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                >
                  <span className="text-indigo-200">+</span> INJECT SIGNAL
                </motion.button>
              </Link>
              <button 
                onClick={refresh} 
                disabled={loading}
                className="w-10 h-10 rounded bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 flex items-center justify-center transition-all disabled:opacity-50"
              >
                {loading ? <span className="animate-spin text-cyan-500">◷</span> : <span>⟳</span>}
              </button>
            </div>
          </div>
        </header>

        {/* Aerospace-style Filter Controls */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
          {filters.map((filter) => {
            const isActive = activeFilter === filter.key;
            return (
              <button
                key={filter.key}
                onClick={() => {
                  const url = filter.key === 'all' ? '/' : `/?type=${filter.key}`;
                  router.push(url);
                }}
                className={`relative flex items-center gap-2 px-4 py-2 rounded text-[11px] font-mono tracking-wider whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? 'text-cyan-300 bg-cyan-950/30 border border-cyan-500/50'
                    : 'text-slate-500 bg-slate-900/40 border border-slate-800 hover:text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeFilterTab" 
                    className="absolute inset-0 border border-cyan-400 rounded pointer-events-none shadow-[inset_0_0_12px_rgba(34,211,238,0.1)]" 
                  />
                )}
                <span>{filter.label}</span>
              </button>
            );
          })}
        </div>

        {error && !loading && (
          <div className="bg-red-950/20 border border-red-900/50 p-6 rounded-lg mb-8 backdrop-blur-sm">
            <p className="text-red-400 font-mono text-sm">ERR_CONNECTION_REFUSED: Telemetry drop.</p>
            <button onClick={refresh} className="mt-3 text-xs font-mono text-slate-400 hover:text-white border-b border-slate-600">
              REINITIALIZE
            </button>
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

        {loading && processedItems.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 relative">
              <div className="absolute inset-0 border-2 border-slate-800 rounded-full" />
              <div className="absolute inset-0 border-2 border-cyan-500 rounded-full border-t-transparent animate-spin" />
            </div>
            <p className="text-cyan-500 font-mono text-xs tracking-widest mt-6 animate-pulse">ESTABLISHING UPLINK...</p>
          </div>
        )}

        {hasMore && userId && (
          <div ref={loadMoreRef} className="flex justify-center py-12">
            {loading ? (
              <span className="text-cyan-500 font-mono text-xs tracking-widest animate-pulse">RETRIEVING PACKETS...</span>
            ) : (
              <div className="h-px w-32 bg-gradient-to-r from-transparent via-slate-700 to-transparent relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-800 border border-slate-600" />
              </div>
            )}
          </div>
        )}

        {!hasMore && processedItems.length > 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-900 border border-slate-800 mb-4 text-slate-500">
              ⎔
            </div>
            <p className="text-slate-500 font-mono text-xs tracking-widest">END OF DATA STREAM</p>
          </div>
        )}

        {!loading && processedItems.length === 0 && !error && (
          <div className="text-center py-24 bg-slate-900/20 border border-slate-800/50 rounded-2xl backdrop-blur-sm">
            <div className="text-slate-600 mb-4 text-3xl">∅</div>
            <p className="text-slate-400 font-mono text-sm uppercase tracking-widest mb-6">
              {activeFilter === 'all'
                ? 'No telemetry signals detected.'
                : `No signals matching [${activeFilter}] protocol.`}
            </p>
            <Link href={createPath}>
              <button className="px-6 py-2 border border-slate-700 text-slate-300 text-xs font-mono tracking-widest hover:bg-slate-800 hover:text-white transition-colors rounded">
                GENERATE NEW SIGNAL
              </button>
            </Link>
          </div>
        )}
      </Container>
    </main>
  );
}