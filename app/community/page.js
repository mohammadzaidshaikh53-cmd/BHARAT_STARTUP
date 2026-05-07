'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useFeed } from '@/lib/hooks/useFeed';
import { useInView } from 'react-intersection-observer';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/image'; // Assuming Image for UI
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/common/Avatar';
import { useRef } from 'react';

const PREFETCH_THRESHOLD = 0.7;

const CONTENT_CONFIG = {
  blog:       { label: 'Blog',       color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',       icon: '✍️', route: (item) => `/blog/${item.slug || item.item_id}` },
  idea:       { label: 'Idea',       color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',     icon: '💡', route: (item) => `/ideas/${item.slug || item.item_id}` },
  biography:  { label: 'Biography',  color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',      icon: '👤', route: (item) => `/biographies/${item.original_id || item.item_id}` },
  motivation: { label: 'Motivation', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20',       icon: '🔥', route: (item) => `/motivation/${item.original_id || item.item_id}` },
  question:   { label: 'Q&A',        color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',  icon: '❓', route: (item) => `/qa/${item.original_id || item.item_id}` },
  discussion: { label: 'Discussion', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',       icon: '💬', route: (item) => `/discussions/${item.original_id || item.item_id}` },
};

function usePostTracking(postId, trackFn) {
  const elementRef = useRef(null);
  const stateRef = useRef({
    maxVisibleRatio: 0,
    visibleStartTime: null,
    cumulativeTime: 0,
    attentionSent: false,
  });

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !trackFn || !postId) return;

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      const ratio = entry.intersectionRatio;

      if (ratio > stateRef.current.maxVisibleRatio) {
        stateRef.current.maxVisibleRatio = ratio;
      }

      if (entry.isIntersecting) {
        if (stateRef.current.visibleStartTime === null) {
          stateRef.current.visibleStartTime = performance.now();
        }
      } else {
        if (stateRef.current.visibleStartTime !== null) {
          const visibleMs = performance.now() - stateRef.current.visibleStartTime;
          stateRef.current.cumulativeTime += visibleMs;
          stateRef.current.visibleStartTime = null;

          if (!stateRef.current.attentionSent && stateRef.current.cumulativeTime >= 4000) {
            trackFn({
              post_id: postId,
              event_type: 'attention',
              metadata: { total_visible_ms: Math.round(stateRef.current.cumulativeTime) },
            });
            stateRef.current.attentionSent = true;
          }
        }
      }
    }, { threshold: [0, 0.5, 1] });

    observer.observe(element);
    return () => observer.disconnect();
  }, [postId, trackFn]);

  return elementRef;
}

function FeedCard({ item, index, onClick, track }) {
  const type = item?.content_type || item?.item_type || 'blog';
  const config = CONTENT_CONFIG[type] || CONTENT_CONFIG.blog;
  const href = config.route(item);
  const postId = item.original_id || item.item_id;
  const trackingRef = usePostTracking(postId, track);
  const [isHovered, setIsHovered] = useState(false);

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
      <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-gray-700/50">
        <Link href={href} className="block" onClick={() => onClick(item)}>
          <div className="p-5 pb-0 flex items-center gap-3">
            <Avatar src={null} alt={item?.author_name || 'Author'} fallback={item?.author_name?.charAt(0) || '?'} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-100 truncate">{item?.author_name || 'Anonymous'}</p>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-medium border ${config.color}`}>
                  {config.icon} {config.label}
                </span>
                <span className="text-gray-600">•</span>
                <span>{item?.created_at ? new Date(item.created_at).toLocaleDateString() : ''}</span>
              </div>
            </div>
          </div>

          <div className="p-5 pt-3">
            <h2 className="text-lg font-bold text-gray-100 mb-2 line-clamp-2 leading-snug">
              {item?.title || 'Untitled'}
            </h2>
            {item?.summary && <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">{item.summary}</p>}
          </div>

          <div className="px-5 py-3 bg-gray-800/50 border-t border-gray-700/50 flex items-center gap-5 text-sm text-gray-400">
            <span className="flex items-center gap-1.5 hover:text-rose-400 transition-colors">👍 {item?.likes || 0}</span>
            <span className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors">💬 {item?.replies || 0}</span>
            <span className="ml-auto font-mono text-orange-400 text-xs">Score: {item?.personalized_score?.toFixed(2)}</span>
          </div>
        </Link>
      </div>
    </motion.article>
  );
}

export default function CommunityFeedPage() {
  const [user, setUser] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user || null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user || null));
    return () => listener?.subscription.unsubscribe();
  }, []);

  const { items, loading, hasMore, error, fetchPage, refresh, prefetchNextPage, track } = useFeed(
    user?.id,
    activeFilter === 'all' ? null : activeFilter
  );

  const { ref: loadMoreRef, inView } = useInView({ threshold: 0.1, rootMargin: '200px' });

  useEffect(() => {
    if (inView) fetchPage();
  }, [inView, fetchPage]);

  // Infinite Scroll Prefetching
  useEffect(() => {
    const handleScroll = () => {
      if (!hasMore || loading) return;
      const scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
      if (scrollPercent >= PREFETCH_THRESHOLD) prefetchNextPage();
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading, prefetchNextPage]);

  const filters = [
    { key: 'all', label: 'All', icon: '🌐' },
    { key: 'blog', label: 'Blog', icon: '📝' },
    { key: 'idea', label: 'Ideas', icon: '💡' },
    { key: 'question', label: 'Q&A', icon: '❓' },
    { key: 'discussion', label: 'Discussions', icon: '💬' },
    { key: 'biography', label: 'Biographies', icon: '👤' },
    { key: 'motivation', label: 'Motivation', icon: '🔥' },
  ];

  const handleCardClick = useCallback((item) => {
    track({
      post_id: item.original_id || item.item_id,
      event_type: 'click',
      metadata: { type: item.content_type, score: item.personalized_score },
    });
  }, [track]);

  return (
    <main className="min-h-screen bg-gray-950 pb-24 relative z-10">
      <Container className="py-6 max-w-3xl pt-20">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 mb-3">Community Feed</h1>
          <p className="text-gray-400 text-lg">Discover ranked content from across the platform</p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-hide">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                activeFilter === f.key
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:text-gray-200 border border-gray-700/50'
              }`}
            >
              <span>{f.icon}</span>
              <span>{f.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-5">
          <AnimatePresence mode="popLayout">
            {items.map((item, idx) => (
              <FeedCard key={item.item_id} item={item} index={idx} onClick={handleCardClick} track={track} />
            ))}
          </AnimatePresence>
        </div>

        {hasMore && user && (
          <div ref={loadMoreRef} className="flex justify-center py-8">
            {loading ? <div className="rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent animate-spin" /> : <span className="text-gray-500 text-sm">↓ Scroll for more</span>}
          </div>
        )}
      </Container>
    </main>
  );
}