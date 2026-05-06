// app/blog/page.js — fixed infinite loop + Write Post button
'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useInView } from 'react-intersection-observer';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { throttle } from 'lodash';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { useScrollVelocity } from '@/lib/hooks/useScrollVelocity';
import { useLRUCache } from '@/lib/hooks/useLRUCache';
import { useEngagementNormalizer } from '@/lib/hooks/useEngagementNormalizer';

// =============================================================================
// CONFIG
// =============================================================================
const ENGAGEMENT_BATCH_URL = process.env.NEXT_PUBLIC_ENGAGEMENT_BATCH_URL || '/api/engagement/batch';
const PAGE_SIZE = 10;
const PREFETCH_THRESHOLD_MOBILE = 0.5;
const PREFETCH_THRESHOLD_DESKTOP = 0.7;

// =============================================================================
// Utilities
// =============================================================================
function isMobile() {
  if (typeof window === 'undefined') return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

async function sendEngagementBatch(events, retries = 2, baseDelay = 500) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const { error } = await supabase.rpc('batch_record_engagement_v2', { events });
      if (!error) return true;
      if (attempt === retries - 1) console.error('Batch failed after retries:', error);
    } catch (e) {
      if (attempt === retries - 1) console.error('Batch exception:', e);
    }
    if (attempt < retries - 1) {
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return false;
}

// -----------------------------------------------------------------------------
// useEngagementQueue (with normalization and rate limiting)
// -----------------------------------------------------------------------------
function useEngagementQueue(userId) {
  const queueRef = useRef([]);
  const flushTimerRef = useRef(null);
  const isFlushingRef = useRef(false);
  const lastEventMap = useRef(new Map());
  const normalize = useEngagementNormalizer();

  const flushQueue = useCallback(async () => {
    if (isFlushingRef.current || queueRef.current.length === 0) return;
    isFlushingRef.current = true;
    const events = [...queueRef.current];
    queueRef.current = [];
    await sendEngagementBatch(events);
    isFlushingRef.current = false;
    if (queueRef.current.length > 0) {
      if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
      flushTimerRef.current = setTimeout(flushQueue, 5000);
    }
  }, []);

  const flushSync = useCallback(() => {
    if (queueRef.current.length === 0) return;
    const events = [...queueRef.current];
    queueRef.current = [];
    const payload = JSON.stringify({ events });
    const blob = new Blob([payload], { type: 'application/json' });
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      try {
        const sent = navigator.sendBeacon(ENGAGEMENT_BATCH_URL, blob);
        if (sent) return;
      } catch (e) { /* fall through */ }
    }
    try {
      fetch(ENGAGEMENT_BATCH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    } catch (e) { /* silent */ }
  }, []);

  const queueEngagement = useCallback((event) => {
    if (!userId) return;
    const normalized = normalize(event);
    const key = `${normalized.post_id}_${normalized.event_type}`;
    const now = Date.now();
    const last = lastEventMap.current.get(key);
    if (last && now - last < 5000) return; // rate limit
    lastEventMap.current.set(key, now);
    if (queueRef.current.length >= 200) queueRef.current.shift();
    queueRef.current.push(normalized);
    if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    flushTimerRef.current = setTimeout(flushQueue, 10000);
  }, [userId, normalize, flushQueue]);

  useEffect(() => {
    return () => {
      if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
      flushSync();
    };
  }, [flushSync]);

  useEffect(() => {
    const handleBeforeUnload = () => flushSync();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flushSync();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [flushSync]);

  return queueEngagement;
}

// -----------------------------------------------------------------------------
// useFeed – with LRU cache, smart prefetch, adaptive boost, diversity
// -----------------------------------------------------------------------------
function useFeed(userId, pageSize = PAGE_SIZE, queueEngagement) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const nextCursorRef = useRef(null);
  const isFetchingRef = useRef(false);
  const prefetchCacheRef = useRef(null);
  const sessionBoostRef = useRef(new Map());
  const hasMoreRef = useRef(hasMore);
  const lastPrefetchTimeRef = useRef(0);
  const postDetailsCache = useLRUCache(500, 5 * 60 * 1000);
  const isMountedRef = useRef(true);
  const scrollVelocity = useScrollVelocity();

  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);
  useEffect(() => { isMountedRef.current = true; return () => { isMountedRef.current = false; }; }, []);

  // Adaptive session boost decay
  const decaySessionBoost = useCallback(() => {
    let changed = false;
    for (let [category, boost] of sessionBoostRef.current.entries()) {
      const newBoost = boost * 0.92;
      if (newBoost < 0.02) sessionBoostRef.current.delete(category);
      else sessionBoostRef.current.set(category, newBoost);
      changed = true;
    }
    if (changed && isMountedRef.current) {
      setPosts(prev => prev.map(p => ({
        ...p,
        ui_score: p.original_score + (sessionBoostRef.current.get(p.category_id) || 0),
      })));
    }
  }, []);

  useEffect(() => {
    const id = setInterval(decaySessionBoost, 10000);
    return () => clearInterval(id);
  }, [decaySessionBoost]);

  const fetchPostDetails = useCallback(async (postIds) => {
    const uncachedIds = postIds.filter(id => !postDetailsCache.get(id));
    if (uncachedIds.length > 0) {
      const { data, error } = await supabase
        .from('content_posts')
        .select('id, title, slug, excerpt, featured_image, published_at, category_id, tags, author_id')
        .in('id', uncachedIds);
      if (error) throw new Error(`Failed to fetch post details: ${error.message}`);
      data?.forEach(detail => postDetailsCache.set(detail.id, detail));
    }
    return postIds.map(id => postDetailsCache.get(id));
  }, [postDetailsCache]);

  const fetchPage = useCallback(async (cursor = null) => {
    if (isFetchingRef.current || !userId) return;
    isFetchingRef.current = true;
    try {
      if (isMountedRef.current) setLoading(true);
      const effectiveCursor = cursor ?? nextCursorRef.current;
      let data, fromCache = false;
      const cache = prefetchCacheRef.current;
      if (cache && Date.now() - cache.ts < 5000 &&
          cache.cursor?.score === effectiveCursor?.score &&
          cache.cursor?.id === effectiveCursor?.id) {
        data = cache.data;
        fromCache = true;
        prefetchCacheRef.current = null;
      } else {
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_personalized_feed_v2', {
          p_user_id: userId,
          p_limit: pageSize,
          p_cursor_score: effectiveCursor?.score ?? 1.0,
          p_cursor_id: effectiveCursor?.id ?? null,
        });
        if (rpcError) throw rpcError;
        data = rpcData;
      }
      if (!data || data.length === 0) { if (isMountedRef.current) setHasMore(false); return; }
      const postIds = data.map(p => p.post_id);
      const details = await fetchPostDetails(postIds);
      const enriched = data.map((p, idx) => ({
        ...p,
        title: details[idx]?.title,
        slug: details[idx]?.slug,
        excerpt: details[idx]?.excerpt,
        featured_image: details[idx]?.featured_image,
        published_at: details[idx]?.published_at,
        category_id: details[idx]?.category_id,
        tags: details[idx]?.tags || [],
        author_id: details[idx]?.author_id,
        original_score: p.total_score,
        ui_score: p.total_score + (sessionBoostRef.current.get(details[idx]?.category_id) || 0),
      }));
      const last = data[data.length - 1];
      const newCursor = { score: last.total_score, id: last.post_id };
      if (isMountedRef.current) {
        setPosts(prev => {
          const existingIds = new Set(prev.map(p => p.post_id));
          const newPosts = enriched.filter(p => !existingIds.has(p.post_id));
          return [...prev, ...newPosts];
        });
      }
      nextCursorRef.current = newCursor;
      if (isMountedRef.current) setHasMore(true);

      // Smart prefetch based on scroll velocity
      if (!fromCache && hasMoreRef.current && Date.now() - lastPrefetchTimeRef.current > 1000) {
        const threshold = isMobile() ? PREFETCH_THRESHOLD_MOBILE : PREFETCH_THRESHOLD_DESKTOP;
        const velocityAdjust = Math.min(1, scrollVelocity / 200);
        const adjustedThreshold = Math.max(0.3, threshold - velocityAdjust * 0.3);
        const scrollPercent = (window.scrollY + window.innerHeight) / document.body.scrollHeight;
        if (scrollPercent > adjustedThreshold) {
          lastPrefetchTimeRef.current = Date.now();
          try {
            const { data: nextData } = await supabase.rpc('get_personalized_feed_v2', {
              p_user_id: userId,
              p_limit: pageSize,
              p_cursor_score: newCursor.score,
              p_cursor_id: newCursor.id,
            });
            if (nextData && nextData.length > 0) {
              prefetchCacheRef.current = { data: nextData, cursor: newCursor, ts: Date.now() };
            }
          } catch (e) { /* silent */ }
        }
      }
    } catch (err) {
      console.error('fetchPage error:', err);
      if (isMountedRef.current) setError(err);
    } finally {
      if (isMountedRef.current) setLoading(false);
      isFetchingRef.current = false;
    }
  }, [userId, pageSize, fetchPostDetails, scrollVelocity]);

  const prefetch = useCallback(async () => {
    if (!userId || !nextCursorRef.current || loading || !hasMoreRef.current || isFetchingRef.current) return;
    if (prefetchCacheRef.current && Date.now() - prefetchCacheRef.current.ts < 5000) return;
    if (Date.now() - lastPrefetchTimeRef.current < 1000) return;
    lastPrefetchTimeRef.current = Date.now();
    try {
      const { data } = await supabase.rpc('get_personalized_feed_v2', {
        p_user_id: userId,
        p_limit: pageSize,
        p_cursor_score: nextCursorRef.current.score,
        p_cursor_id: nextCursorRef.current.id,
      });
      if (data && data.length > 0) {
        prefetchCacheRef.current = { data, cursor: nextCursorRef.current, ts: Date.now() };
      }
    } catch (e) { /* ignore */ }
  }, [userId, pageSize, loading]);

  const refresh = useCallback(async () => {
    if (!isMountedRef.current) return;
    setPosts([]);
    nextCursorRef.current = null;
    prefetchCacheRef.current = null;
    sessionBoostRef.current.clear();
    postDetailsCache.clear();
    setHasMore(true);
    setError(null);
    await fetchPage(null);
  }, [fetchPage, postDetailsCache]);

  // Run refresh once on mount or userId change – NOT on refresh itself
  useEffect(() => {
    refresh();
  }, [userId]); // ✅ removed `refresh` from dependencies to prevent loop

  const recordClick = useCallback((post) => {
    const category = post.category_id;
    const currentBoost = category ? (sessionBoostRef.current.get(category) || 0) : 0;
    const newBoost = Math.min(0.5, currentBoost + 0.12);
    if (category) sessionBoostRef.current.set(category, newBoost);
    if (isMountedRef.current) {
      setPosts(prev => prev.map(p =>
        p.post_id === post.post_id
          ? { ...p, ui_score: p.original_score + (category ? sessionBoostRef.current.get(category) : 0) }
          : p
      ));
    }
    queueEngagement({
      user_id: userId,
      post_id: post.post_id,
      event_type: 'click',
      metadata: { feed_type: post.feed_type, original_score: post.original_score, ui_score: post.ui_score },
    });
  }, [userId, queueEngagement]);

  return { posts, loading, hasMore, error, fetchPage, prefetch, refresh, recordClick };
}

// -----------------------------------------------------------------------------
// useEngagementTracking (optimized)
// -----------------------------------------------------------------------------
function useEngagementTracking(posts, userId, queueEngagement) {
  const postRefs = useRef(new Map());
  const timersRef = useRef(new Map());
  const scrollMaxRef = useRef(new Map());
  const observerRef = useRef(null);
  const triggeredAttention = useRef(new Set());

  useEffect(() => {
    if (!userId) return;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const postId = entry.target.getAttribute('data-post-id');
          if (!postId) return;
          if (entry.isIntersecting) {
            if (timersRef.current.has(postId)) clearTimeout(timersRef.current.get(postId));
            if (!triggeredAttention.current.has(postId)) {
              const timer = setTimeout(() => {
                queueEngagement({
                  user_id: userId,
                  post_id: postId,
                  event_type: 'attention',
                  metadata: { duration: 5 },
                });
                triggeredAttention.current.add(postId);
                timersRef.current.delete(postId);
              }, 5000);
              timersRef.current.set(postId, timer);
            }
          } else {
            if (timersRef.current.has(postId)) {
              clearTimeout(timersRef.current.get(postId));
              timersRef.current.delete(postId);
            }
            const depth = scrollMaxRef.current.get(postId) || 0;
            if (depth > 0) {
              queueEngagement({
                user_id: userId,
                post_id: postId,
                event_type: 'scroll_depth',
                metadata: { depth },
              });
              scrollMaxRef.current.delete(postId);
            }
          }
        });
      },
      { threshold: 0.5 }
    );
    return () => observerRef.current?.disconnect();
  }, [userId, queueEngagement]);

  useEffect(() => {
    const observer = observerRef.current;
    if (!observer) return;
    for (let element of postRefs.current.values()) {
      observer.observe(element);
    }
    return () => {
      for (let element of postRefs.current.values()) {
        observer.unobserve(element);
      }
    };
  }, [posts]);

  useEffect(() => {
    if (!userId) return;
    const handleScroll = throttle(() => {
      const viewportHeight = window.innerHeight;
      for (let [postId, element] of postRefs.current.entries()) {
        const rect = element.getBoundingClientRect();
        if (rect.height === 0) continue;
        const visiblePercent = (Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0)) / rect.height;
        if (visiblePercent > 0) {
          const currentMax = scrollMaxRef.current.get(postId) || 0;
          scrollMaxRef.current.set(postId, Math.max(currentMax, visiblePercent));
        }
      }
    }, 100);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => { window.removeEventListener('scroll', handleScroll); handleScroll.cancel(); };
  }, [userId]);

  const registerPostRef = useCallback((postId, element) => {
    if (element) {
      postRefs.current.set(postId, element);
      if (observerRef.current) observerRef.current.observe(element);
    } else {
      const old = postRefs.current.get(postId);
      if (old && observerRef.current) observerRef.current.unobserve(old);
      postRefs.current.delete(postId);
    }
  }, []);

  return { registerPostRef };
}

// -----------------------------------------------------------------------------
// Diversity & Anti-Fatigue (enhanced)
// -----------------------------------------------------------------------------
function applyDiversityAndAntiFatigue(rawPosts, scrollSpeed, maxSameCategory = 2, maxSameAuthor = 2, maxSameTag = 3) {
  if (rawPosts.length === 0) return rawPosts;
  let processed = rawPosts;
  if (scrollSpeed === 'fast') {
    processed = rawPosts.map(post => ({
      ...post,
      ui_score: (post.excerpt?.length || 0) > 300 ? post.ui_score * 0.9 : post.ui_score,
    }));
  }
  const sorted = [...processed].sort((a, b) => b.ui_score - a.ui_score);
  const result = [];
  let lastCategory = null, sameCatCount = 0;
  let lastAuthor = null, sameAuthorCount = 0;
  const tagFrequency = new Map();

  for (const post of sorted) {
    const category = post.category_id || 'uncategorized';
    const author = post.author_id;
    if (category === lastCategory && sameCatCount >= maxSameCategory) {
      result.push({ ...post, _deferred: true });
      continue;
    }
    if (author === lastAuthor && sameAuthorCount >= maxSameAuthor) {
      result.push({ ...post, _deferred: true });
      continue;
    }
    let tagOverlap = false;
    if (post.tags) {
      for (const tag of post.tags) {
        if ((tagFrequency.get(tag) || 0) >= maxSameTag) {
          tagOverlap = true;
          break;
        }
      }
    }
    if (tagOverlap) {
      result.push({ ...post, _deferred: true });
      continue;
    }
    if (category === lastCategory) sameCatCount++;
    else { lastCategory = category; sameCatCount = 1; }
    if (author === lastAuthor) sameAuthorCount++;
    else { lastAuthor = author; sameAuthorCount = 1; }
    post.tags?.forEach(tag => tagFrequency.set(tag, (tagFrequency.get(tag) || 0) + 1));
    result.push(post);
  }
  const deferred = result.filter(p => p._deferred);
  const final = result.filter(p => !p._deferred);
  final.push(...deferred.map(p => { delete p._deferred; return p; }));
  return final;
}

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------
export default function BlogFeedPage() {
  const [user, setUser] = useState(null);
  const [scrollSpeed, setScrollSpeed] = useState('slow');
  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(Date.now());
  const scrollVelocity = useScrollVelocity();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user || null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user || null));
    return () => listener?.subscription.unsubscribe();
  }, []);

  const queueEngagement = useEngagementQueue(user?.id || null);
  const { posts: rawPosts, loading, hasMore, error, fetchPage, prefetch, refresh, recordClick } = useFeed(user?.id || null, PAGE_SIZE, queueEngagement);

  useEffect(() => {
    const handleCombined = throttle(() => {
      const now = Date.now();
      const scrollDelta = Math.abs(window.scrollY - lastScrollY.current);
      const timeDelta = now - lastScrollTime.current;
      if (timeDelta > 0) {
        const speed = scrollDelta / timeDelta;
        setScrollSpeed(speed > 0.5 ? 'fast' : 'slow');
      }
      lastScrollY.current = window.scrollY;
      lastScrollTime.current = now;
      const scrollPercent = (window.scrollY + window.innerHeight) / document.body.scrollHeight;
      const threshold = isMobile() ? PREFETCH_THRESHOLD_MOBILE : PREFETCH_THRESHOLD_DESKTOP;
      if (scrollPercent > threshold && !loading && hasMore) prefetch();
    }, 100);
    window.addEventListener('scroll', handleCombined, { passive: true });
    return () => { window.removeEventListener('scroll', handleCombined); handleCombined.cancel(); };
  }, [loading, hasMore, prefetch]);

  const displayPosts = useMemo(() => applyDiversityAndAntiFatigue(rawPosts, scrollSpeed, 2, 2, 3), [rawPosts, scrollSpeed]);
  const { registerPostRef } = useEngagementTracking(displayPosts, user?.id || null, queueEngagement);
  const { ref: loadMoreRef, inView } = useInView({ threshold: 0.1 });
  useEffect(() => { if (inView && !loading && hasMore) fetchPage(); }, [inView, loading, hasMore, fetchPage]);

  if (!user) {
    return (
      <Container className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-gray-600 mb-4">Please log in to see your personalized feed.</p>
          <a href="/login" className="text-orange-600 underline">Login</a>
        </div>
      </Container>
    );
  }

  if (error && !loading) {
    return (
      <Container className="min-h-screen py-12">
        <div className="text-center bg-red-50 dark:bg-red-500/10 p-8 rounded-2xl">
          <p className="text-red-600">Failed to load feed. Please try again.</p>
          <Button onClick={refresh} variant="secondary" className="mt-4">Retry</Button>
        </div>
      </Container>
    );
  }

  const showSkeleton = loading && displayPosts.length === 0;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      <Container className="py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📰 Your Personalized Feed</h1>
          <div className="flex gap-2">
            <Link href="/blog/new">
              <Button variant="primary" size="sm">✍️ Write Post</Button>
            </Link>
            <Button onClick={refresh} variant="secondary" size="sm">🔄 Refresh</Button>
          </div>
        </div>
        <div className="space-y-6">
          <AnimatePresence>
            {displayPosts.map((post, idx) => (
              <motion.article
                key={post.post_id}
                data-post-id={post.post_id}
                ref={(el) => registerPostRef(post.post_id, el)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition overflow-hidden"
                onClick={() => recordClick(post)}
              >
                <Link href={`/blog/${post.slug}`} className="block">
                  {post.featured_image && (
                    <div className="relative w-full h-48">
                      <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                        {post.feed_type}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Score: {post.ui_score.toFixed(2)}
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold mb-2 line-clamp-2 dark:text-white">{post.title}</h2>
                    <p className="text-gray-600 dark:text-gray-300 line-clamp-3">{post.excerpt}</p>
                    {post.published_at && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                        {new Date(post.published_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </Link>
              </motion.article>
            ))}
          </AnimatePresence>
          {showSkeleton && (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200 dark:bg-gray-700" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {!hasMore && displayPosts.length > 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">✨ You're all caught up! ✨</p>
              <Button onClick={refresh} variant="ghost" size="sm">🔄 Explore more</Button>
            </div>
          )}
          {hasMore && (
            <div ref={loadMoreRef} className="flex justify-center py-8">
              {loading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              ) : (
                <span className="text-gray-400 text-sm">Scroll for more</span>
              )}
            </div>
          )}
        </div>
      </Container>
    </main>
  );
}