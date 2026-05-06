'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useInView } from 'react-intersection-observer';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/common/Avatar';

const PAGE_SIZE = 12;
const PREFETCH_THRESHOLD = 0.7;
const BOOST_DECAY_INTERVAL_MS = 10000;
const BOOST_DECAY_FACTOR = 0.92;

// =============================================================================
// Mobile Detection
// =============================================================================
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

// =============================================================================
// Particle Background (FIXED: useEffect, not useState)
// =============================================================================
function ParticleField() {
  const canvasRef = useRef(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        hue: Math.random() * 60 + 20,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
          p.x = (p.x + canvas.width) % canvas.width;
          p.y = (p.y + canvas.height) % canvas.height;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${p.opacity})`;
        ctx.fill();
      });

      // Draw connections
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `hsla(30, 80%, 60%, ${0.1 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.4 }}
    />
  );
}

// =============================================================================
// Content Type Config (ALIGNED WITH BACKEND)
// =============================================================================
const CONTENT_CONFIG = {
  blog:       { label: 'Blog',       color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',       icon: '✍️', route: (item) => `/blog/${item.slug || item.item_id}` },
  idea:       { label: 'Idea',       color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',     icon: '💡', route: (item) => `/ideas/${item.slug || item.item_id}` },
  biography:  { label: 'Biography',  color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',      icon: '👤', route: (item) => `/biographies/${item.original_id || item.item_id}` },
  motivation: { label: 'Motivation', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20',       icon: '🔥', route: (item) => `/motivation/${item.original_id || item.item_id}` },
  question:   { label: 'Q&A',        color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',  icon: '❓', route: (item) => `/qa/${item.original_id || item.item_id}` },
  discussion: { label: 'Discussion', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',       icon: '💬', route: (item) => `/discussions/${item.original_id || item.item_id}` },
};

const CREATE_ROUTES = {
  all: '/blog/new',
  blog: '/blog/new',
  idea: '/ideas/new',
  question: '/qa/new',
  discussion: '/discussions/new',
  biography: '/biographies/new',
  motivation: '/motivation/new',
};

function getContentConfig(item) {
  const type = item?.content_type || item?.item_type || 'blog';
  return CONTENT_CONFIG[type] || CONTENT_CONFIG.blog;
}

// =============================================================================
// useStableRef
// =============================================================================
function useStableRef(value) {
  const ref = useRef(value);
  useEffect(() => { ref.current = value; }, [value]);
  return ref;
}

// =============================================================================
// useCommunityFeed (FIXED: proper error handling, safe guards)
// =============================================================================
function useCommunityFeed(userId) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const userIdRef = useStableRef(userId);
  const hasMoreRef = useStableRef(hasMore);
  const loadingRef = useStableRef(loading);
  const cursorRef = useRef({ score: 1.0, id: null });
  const isFetchingRef = useRef(false);
  const prefetchCacheRef = useRef(null);

  const fetchPage = useCallback(async (isRefresh = false) => {
    const currentUserId = userIdRef.current;
    if (!currentUserId) return;
    if (isFetchingRef.current) return;
    if (!isRefresh && !hasMoreRef.current) return;

    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const cursor = isRefresh ? { score: 1.0, id: null } : cursorRef.current;
      const cursorKey = `${cursor.score}_${cursor.id}`;

      let data = null;
      if (prefetchCacheRef.current && prefetchCacheRef.current.cursorKey === cursorKey) {
        data = prefetchCacheRef.current.data;
        prefetchCacheRef.current = null;
      }

      if (!data) {
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_personalized_feed_v5', {
          p_user_id: currentUserId,
          p_limit: PAGE_SIZE,
          p_cursor_score: cursor.score,
          p_cursor_id: cursor.id,
        });
        if (rpcError) throw rpcError;
        data = rpcData;
      }

      // SAFE GUARD: ensure data is array
      if (!Array.isArray(data) || data.length === 0) {
        setHasMore(false);
        return;
      }

      // SAFE GUARD: validate last item has required fields
      const last = data[data.length - 1];
      if (last?.personalized_score !== undefined && last?.item_id !== undefined) {
        cursorRef.current = { score: last.personalized_score, id: last.item_id };
      }

      setItems(prev => {
        if (isRefresh) return data;
        const existingIds = new Set(prev.map(i => i.item_id));
        return [...prev, ...data.filter(i => i?.item_id && !existingIds.has(i.item_id))];
      });
      setHasMore(data.length === PAGE_SIZE);
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
      const { data, error: rpcError } = await supabase.rpc('get_personalized_feed_v5', {
        p_user_id: currentUserId,
        p_limit: PAGE_SIZE,
        p_cursor_score: nextCursor.score,
        p_cursor_id: nextCursor.id,
      });
      if (!rpcError && data && data.length > 0) {
        prefetchCacheRef.current = { cursorKey, data };
      }
    } catch (err) {
      console.warn('Prefetch failed:', err?.message);
    }
  }, []);

  const refresh = useCallback(() => {
    if (!userIdRef.current) return;
    setItems([]);
    cursorRef.current = { score: 1.0, id: null };
    prefetchCacheRef.current = null;
    setHasMore(true);
    setError(null);
    fetchPage(true);
  }, [fetchPage]);

  useEffect(() => {
    if (userId) {
      refresh();
    }
  }, [userId]);

  return { items, loading, hasMore, error, fetchPage, refresh, prefetchNextPage };
}

// =============================================================================
// useSimpleEngagement (FIXED: stable via refs, proper batching)
// =============================================================================
function useSimpleEngagement(userId) {
  const bufferRef = useRef([]);
  const timerRef = useRef(null);
  const userIdRef = useStableRef(userId);
  const flushInProgressRef = useRef(false);

  const flush = useCallback(async () => {
    if (flushInProgressRef.current) return;
    if (!bufferRef.current.length || !userIdRef.current) return;

    const events = [...bufferRef.current];
    bufferRef.current = [];
    flushInProgressRef.current = true;

    try {
      await supabase.rpc('batch_record_engagement_v2', { events });
    } catch (e) {
      console.warn('Engagement flush failed:', e?.message);
      // Re-buffer failed events
      bufferRef.current = [...events, ...bufferRef.current].slice(0, 100);
    } finally {
      flushInProgressRef.current = false;
    }
  }, []);

  const track = useCallback((event) => {
    if (!userIdRef.current || !event?.post_id) return;
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
    boostMapRef.current.set(category, current + 0.3);
    forceUpdate({});
  }, []);

  const getBoost = useCallback((category) => {
    return boostMapRef.current.get(category) || 0;
  }, []);

  return { boostCategory, getBoost };
}

// =============================================================================
// Diversity Layer
// =============================================================================
function applyDiversity(items) {
  if (!Array.isArray(items) || items.length === 0) return [];
  const result = [];
  const deferred = [];

  for (const item of items) {
    const contentType = item?.content_type || item?.item_type;
    const author = item?.author_name;

    let sameContentCount = 0;
    let sameAuthorCount = 0;
    for (let i = result.length - 1; i >= 0 && i >= result.length - 2; i--) {
      if ((result[i]?.content_type || result[i]?.item_type) === contentType) sameContentCount++;
      if (result[i]?.author_name === author) sameAuthorCount++;
    }

    if (sameContentCount >= 2 || sameAuthorCount >= 2) {
      deferred.push(item);
    } else {
      result.push(item);
    }
  }
  return [...result, ...deferred];
}

// =============================================================================
// usePostTracking (FIXED: proper cleanup, safe refs)
// =============================================================================
function usePostTracking(postId, trackFn) {
  const elementRef = useRef(null);
  const stateRef = useRef({
    maxVisibleRatio: 0,
    visibleStartTime: null,
    cumulativeTime: 0,
    attentionSent: false,
  });
  const trackRef = useStableRef(trackFn);
  const postIdRef = useStableRef(postId);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !trackRef.current || !postIdRef.current) return;

    const state = stateRef.current;
    let throttleTimer = null;
    let isActive = true;

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
      if (!isActive) return;
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
        if (state.visibleStartTime !== null) {
          state.cumulativeTime += performance.now() - state.visibleStartTime;
          state.visibleStartTime = null;
          sendScrollDepth();

          if (!state.attentionSent && state.cumulativeTime >= 4000 && trackRef.current) {
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
      isActive = false;
      if (throttleTimer) clearTimeout(throttleTimer);
      observer.disconnect();
      if (state.visibleStartTime !== null) {
        state.cumulativeTime += performance.now() - state.visibleStartTime;
      }
      if (state.maxVisibleRatio > 0) sendScrollDepth();
      if (!state.attentionSent && state.cumulativeTime >= 4000 && trackRef.current) {
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
// FeedCard (FIXED: safe field access, proper engagement tracking)
// =============================================================================
function FeedCard({ item, index, onClick, track, boostCategory }) {
  const config = getContentConfig(item);
  const href = config.route(item);
  const contentType = item?.content_type || item?.item_type;
  // FIXED: use original_id for engagement tracking (matches backend schema)
  const postId = item?.original_id || item?.item_id;
  const trackingRef = usePostTracking(postId, track);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = useCallback(() => {
    onClick?.();
    if (boostCategory && contentType) boostCategory(contentType);
  }, [onClick, boostCategory, contentType]);

  // SAFE GUARD: skip invalid items
  if (!item?.item_id) return null;

  return (
    <motion.article
      ref={trackingRef}
      layout
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{
        delay: Math.min(index * 0.08, 0.4),
        duration: 0.5,
        type: 'spring',
        stiffness: 100,
        damping: 15,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
    >
      <motion.div
        animate={{
          boxShadow: isHovered
            ? '0 20px 40px -10px rgba(0,0,0,0.3), 0 0 20px rgba(249,115,22,0.1)'
            : '0 4px 6px -1px rgba(0,0,0,0.1)',
        }}
        transition={{ duration: 0.3 }}
        className="bg-gray-900/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-gray-700/50"
      >
        <Link href={href} className="block" onClick={handleClick}>
          <motion.div
            className="h-0.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isHovered ? 1 : 0 }}
            transition={{ duration: 0.4 }}
            style={{ transformOrigin: 'left' }}
          />

          <div className="p-5 pb-0 flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Avatar src={null} alt={item?.author_name || 'Author'} fallback={item?.author_name?.charAt(0) || '?'} size="sm" />
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-100 truncate">{item?.author_name || 'Anonymous'}</p>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                <motion.span whileHover={{ scale: 1.05 }} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-medium border ${config.color}`}>
                  {config.icon} {config.label}
                </motion.span>
                <span className="text-gray-600">•</span>
                <span>{item?.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
              </div>
            </div>
          </div>

          <div className="p-5 pt-3">
            <motion.h2
              className="text-lg font-bold text-gray-100 mb-2 line-clamp-2 leading-snug"
              animate={{ color: isHovered ? '#fb923c' : '#f3f4f6' }}
              transition={{ duration: 0.2 }}
            >
              {item?.title || 'Untitled'}
            </motion.h2>
            {item?.summary && <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">{item.summary}</p>}
          </div>

          <div className="px-5 py-3 bg-gray-800/50 border-t border-gray-700/50 flex items-center gap-5 text-sm">
            <motion.span whileHover={{ scale: 1.1, y: -2 }} className="flex items-center gap-1.5 text-gray-400 hover:text-rose-400 transition-colors cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              {item?.likes || 0}
            </motion.span>
            <motion.span whileHover={{ scale: 1.1, y: -2 }} className="flex items-center gap-1.5 text-gray-400 hover:text-cyan-400 transition-colors cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              {item?.replies || 0}
            </motion.span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              className="ml-auto text-xs text-orange-400 font-mono"
            >
              Score: {item?.personalized_score?.toFixed(2) || '0.00'}
            </motion.span>
          </div>
        </Link>
      </motion.div>
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
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-2xl h-48 border border-gray-700/30 overflow-hidden relative"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/20 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          />
        </motion.div>
      ))}
    </div>
  );
}

// =============================================================================
// Filter Pill
// =============================================================================
function FilterPill({ filter, isActive, onClick }) {
  return (
    <motion.button
      onClick={() => onClick(filter.key)}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className={`relative flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
        isActive ? 'text-white' : 'bg-gray-800/50 text-gray-400 hover:text-gray-200 border border-gray-700/50'
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="activeFilter"
          className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
      <span className="relative z-10">{filter.icon}</span>
      <span className="relative z-10">{filter.label}</span>
    </motion.button>
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
// Floating Action Button
// =============================================================================
function FloatingActionButton({ href, icon }) {
  return (
    <motion.div
      className="fixed bottom-8 right-8 z-50"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 1 }}
    >
      <Link href={href}>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/40 flex items-center justify-center text-2xl"
        >
          {icon}
        </motion.button>
      </Link>
    </motion.div>
  );
}

// =============================================================================
// Main Page (FIXED: all effects stable, proper deps, safe guards)
// =============================================================================
export default function CommunityFeedPage() {
  const [user, setUser] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [headerScrolled, setHeaderScrolled] = useState(false);

  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [0, 1]);
  const headerY = useTransform(scrollY, [0, 100], [-20, 0]);

  useEffect(() => {
    const handleScroll = () => setHeaderScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        setUser(session?.user || null);

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
          if (!mounted) return;
          setUser(session?.user || null);
        });

        return () => listener?.subscription?.unsubscribe();
      } catch (err) {
        console.error('Auth error:', err);
      }
    };
    init();
    return () => { mounted = false; };
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

  // FIXED: Memoized processed items with safe guards
  const processedItems = useMemo(() => {
    if (!Array.isArray(items) || items.length === 0) return [];
    const boosted = items.map(item => ({
      ...item,
      ui_score: (item?.personalized_score || 0) + getBoost(item?.content_type || item?.item_type),
    }));
    const sorted = [...boosted].sort((a, b) => (b?.ui_score || 0) - (a?.ui_score || 0));
    const diversified = applyDiversity(sorted);
    if (activeFilter === 'all') return diversified;
    return diversified.filter(item => (item?.content_type || item?.item_type) === activeFilter);
  }, [items, getBoost, activeFilter]);

  // FIXED: Engagement tracking uses original_id
  const handleCardClick = useCallback((item) => {
    const targetId = item?.original_id || item?.item_id;
    if (!targetId) return;
    track({
      post_id: targetId,
      event_type: 'click',
      metadata: { 
        type: item?.content_type || item?.item_type, 
        score: item?.personalized_score 
      },
    });
  }, [track]);

  // FIXED: Memoized filters
  const filters = useMemo(() => [
    { key: 'all', label: 'All', icon: '🌐' },
    { key: 'blog', label: 'Blog', icon: '📝' },
    { key: 'idea', label: 'Ideas', icon: '💡' },
    { key: 'question', label: 'Q&A', icon: '❓' },
    { key: 'discussion', label: 'Discussions', icon: '💬' },
    { key: 'biography', label: 'Biographies', icon: '👤' },
    { key: 'motivation', label: 'Motivation', icon: '🔥' },
  ], []);

  const createPath = CREATE_ROUTES[activeFilter] || '/blog/new';

  return (
    <>
      <ParticleField />

      <motion.header
        style={{ opacity: headerOpacity, y: headerY }}
        className="fixed top-0 left-0 right-0 z-40 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50"
      >
        <Container className="py-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">🏘️ Community</h2>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={refresh} disabled={loading}>
              {loading ? '⟳' : '🔄'} Refresh
            </Button>
          </div>
        </Container>
      </motion.header>

      <main className="min-h-screen bg-gray-950 pb-24 relative z-10">
        <Container className="py-6 max-w-3xl pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="mb-8"
          >
            <motion.h1
              className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 mb-3"
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
              style={{ backgroundSize: '200% 200%' }}
            >
              Community Feed
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-400 text-lg"
            >
              Discover blogs, ideas, questions, and discussions
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
          >
            <Button variant="primary" size="sm">
              <Link href={createPath} className="flex items-center gap-2">
                ✍️ Create {activeFilter === 'all' ? 'Post' : filters.find(f => f.key === activeFilter)?.label}
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-hide"
          >
            {filters.map(filter => (
              <FilterPill
                key={filter.key}
                filter={filter}
                isActive={activeFilter === filter.key}
                onClick={setActiveFilter}
              />
            ))}
          </motion.div>

          <AnimatePresence>
            {error && !loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center bg-red-500/10 backdrop-blur-sm border border-red-500/20 p-8 rounded-2xl mb-6"
              >
                <motion.p
                  animate={{ x: [-2, 2, -2, 0] }}
                  transition={{ duration: 0.5 }}
                  className="text-red-400 text-lg mb-4"
                >
                  ⚠️ Failed to load feed
                </motion.p>
                <Button variant="secondary" onClick={refresh}>
                  🔄 Retry
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-5">
            <AnimatePresence mode="popLayout">
              {processedItems.map((item, idx) => (
                <FeedCard
                  key={item?.item_id || `item-${idx}`}
                  item={item}
                  index={idx}
                  onClick={() => handleCardClick(item)}
                  track={track}
                  boostCategory={boostCategory}
                />
              ))}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {loading && processedItems.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <FeedSkeleton count={3} />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {hasMore && userId && (
              <motion.div
                ref={loadMoreRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center py-8"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent"
                  />
                ) : (
                  <motion.span
                    animate={{ y: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-gray-500 text-sm"
                  >
                    ↓ Scroll for more
                  </motion.span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {!hasMore && processedItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <motion.p
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="text-gray-400 text-lg mb-4"
                >
                  ✨ You&apos;re all caught up! ✨
                </motion.p>
                <Button variant="ghost" size="sm" onClick={refresh}>
                  🔄 Explore more
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {!loading && processedItems.length === 0 && !error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <motion.div
                  animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="text-6xl mb-6"
                >
                  📭
                </motion.div>
                <p className="text-gray-400 text-lg mb-6">
                  {activeFilter === 'all' ? "No posts yet. Be the first!" : `No ${activeFilter} posts found.`}
                </p>
                <Button variant="primary" size="sm">
                  <Link href={createPath}>
                    ✨ Create First Post
                  </Link>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Container>
      </main>

      <FloatingActionButton href={createPath} icon="✍️" />
    </>
  );
}