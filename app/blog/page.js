'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useFeed } from '@/lib/hooks/useFeed';
import { useInView } from 'react-intersection-observer';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { useRef } from 'react';

const PREFETCH_THRESHOLD = 0.7;

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

function BlogCard({ post, index, onClick, track }) {
  const postId = post.original_id || post.item_id;
  const trackingRef = usePostTracking(postId, track);

  return (
    <motion.article
      ref={trackingRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.3) }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition overflow-hidden"
      onClick={() => onClick(post)}
    >
      <Link href={`/blog/${post.slug || post.item_id}`} className="block">
        {post.featured_image && (
          <div className="relative w-full h-48">
            <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
          </div>
        )}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full uppercase font-bold text-gray-500">
              {post.item_type || 'Blog'}
            </span>
            <span className="text-xs text-orange-500 font-mono">
              Score: {post.personalized_score?.toFixed(2)}
            </span>
          </div>
          <h2 className="text-xl font-bold mb-2 line-clamp-2 dark:text-white leading-snug">{post.title}</h2>
          <p className="text-gray-600 dark:text-gray-300 line-clamp-3 text-sm leading-relaxed">{post.summary}</p>
          {post.created_at && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
              {new Date(post.created_at).toLocaleDateString()}
            </p>
          )}
        </div>
      </Link>
    </motion.article>
  );
}

export default function BlogFeedPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user || null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user || null));
    return () => listener?.subscription.unsubscribe();
  }, []);

  const { items: posts, loading, hasMore, error, fetchPage, refresh, prefetchNextPage, track } = useFeed(user?.id, 'blog');

  const { ref: loadMoreRef, inView } = useInView({ threshold: 0.1 });

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

  const handleCardClick = useCallback((post) => {
    track({
      post_id: post.original_id || post.item_id,
      event_type: 'click',
      metadata: { type: 'blog', score: post.personalized_score },
    });
  }, [track]);

  if (!user) {
    return (
      <Container className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl">
          <p className="text-gray-600 dark:text-gray-400 mb-6 font-medium">Sign in to unlock your personalized blog feed.</p>
          <Link href="/login">
            <Button variant="primary">Login to Continue</Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      <Container className="py-8">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white">Personalized Feed</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Curated stories based on your interests</p>
          </div>
          <div className="flex gap-3">
            <Link href="/blog/new">
              <Button variant="primary" size="sm">✍️ Write Post</Button>
            </Link>
            <Button onClick={refresh} variant="secondary" size="sm">🔄 Refresh</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatePresence mode="popLayout">
            {posts.map((post, idx) => (
              <BlogCard key={post.item_id} post={post} index={idx} onClick={handleCardClick} track={track} />
            ))}
          </AnimatePresence>
        </div>

        {hasMore && (
          <div ref={loadMoreRef} className="flex justify-center py-12">
            {loading ? (
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent" />
            ) : (
              <span className="text-gray-400 text-sm font-medium">Keep scrolling for more stories</span>
            )}
          </div>
        )}

        {!hasMore && posts.length > 0 && (
          <div className="text-center py-16 border-t border-gray-200 dark:border-gray-700 mt-8">
            <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium">✨ You've read all your stories for now! ✨</p>
            <Button onClick={refresh} variant="ghost" size="sm">🔄 Refresh Feed</Button>
          </div>
        )}
      </Container>
    </main>
  );
}