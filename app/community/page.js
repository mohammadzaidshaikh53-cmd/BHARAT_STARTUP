'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useFeed } from '@/lib/hooks/useFeed';
import { useInView } from 'react-intersection-observer';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/common/Avatar';
import { usePostTracking } from '@/lib/hooks/usePostTracking';
import {
  Users,
  MessageSquare,
  HelpCircle,
  Lightbulb,
  FileText,
  TrendingUp,
  ChevronRight,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

const springConfig = { type: 'spring', stiffness: 350, damping: 28 };

const CONTENT_CONFIG = {
  blog:       { label: 'Blog',       color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',       icon: '✍️', route: (item) => `/blog/${item.slug || item.item_id}` },
  idea:       { label: 'Idea',       color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',     icon: '💡', route: (item) => `/ideas/${item.slug || item.item_id}` },
  biography:  { label: 'Biography',  color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',      icon: '👤', route: (item) => `/biographies/${item.original_id || item.item_id}` },
  motivation: { label: 'Motivation', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20',       icon: '🔥', route: (item) => `/motivation/${item.original_id || item.item_id}` },
  question:   { label: 'Q&A',        color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',  icon: '❓', route: (item) => `/qa/${item.original_id || item.item_id}` },
  discussion: { label: 'Discussion', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',       icon: '💬', route: (item) => `/discussions/${item.original_id || item.item_id}` },
};

// Navigation sections with physics-enhanced transitions
const NAV_SECTIONS = [
  { key: 'feed', label: 'Feed', icon: TrendingUp, href: '/community', description: 'Personalized content' },
  { key: 'forums', label: 'Forums', icon: Users, href: '/community/forums', description: 'Industry discussions' },
  { key: 'questions', label: 'Q&A', icon: HelpCircle, href: '/community/questions', description: 'Expert answers' },
  { key: 'discussions', label: 'Discussions', icon: MessageSquare, href: '/discussions', description: 'Join conversations' },
];

// usePostTracking is now imported from @/lib/hooks/usePostTracking

function FeedCard({ item, index, onClick, track }) {
  const type = item?.content_type || item?.item_type || 'blog';
  const config = CONTENT_CONFIG[type] || CONTENT_CONFIG.blog;
  const href = config.route(item);
  const postId = item.original_id || item.item_id;
  const { elementRef } = usePostTracking(postId, type, track);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.article
      ref={elementRef}
      layout
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={springConfig}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -4, transition: springConfig }}
      className="group relative"
    >
      <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-gray-700/50 hover:border-orange-500/30 transition-colors duration-300">
        <Link href={href} className="block" onClick={() => onClick(item)}>
          <div className="p-5 pb-0 flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={springConfig}
            >
              <Avatar src={null} alt={item?.author_name || 'Author'} fallback={item?.author_name?.charAt(0) || '?'} size="sm" />
            </motion.div>
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
            <motion.div
              animate={{ rotate: isHovered ? 0 : -90, opacity: isHovered ? 1 : 0.5 }}
              transition={springConfig}
            >
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </motion.div>
          </div>

          <div className="p-5 pt-3">
            <h2 className="text-lg font-bold text-gray-100 mb-2 line-clamp-2 leading-snug group-hover:text-orange-400 transition-colors">
              {item?.title || 'Untitled'}
            </h2>
            {item?.summary && <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">{item.summary}</p>}
          </div>

          <div className="px-5 py-3 bg-gray-800/50 border-t border-gray-700/50 flex items-center gap-5 text-sm text-gray-400">
            <motion.span
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-1.5 hover:text-rose-400 transition-colors cursor-pointer"
            >
              👍 {item?.likes || 0}
            </motion.span>
            <motion.span
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors cursor-pointer"
            >
              💬 {item?.replies || 0}
            </motion.span>
          </div>
        </Link>
      </div>
    </motion.article>
  );
}

// Navigation Section - Enterprise Hub Navigation
function CommunityNavSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springConfig}
      className="mb-8"
    >
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-bold text-gray-100">Explore Community</h2>
        <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Beta
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {NAV_SECTIONS.map((section, index) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springConfig, delay: index * 0.1 }}
              whileHover={{ y: -4, transition: springConfig }}
            >
              <Link
                href={section.href}
                className="flex flex-col p-4 rounded-xl bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 hover:border-purple-500/40 transition-all duration-300 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-purple-400" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
                </div>
                <h3 className="font-semibold text-gray-100 text-sm mb-1">{section.label}</h3>
                <p className="text-xs text-gray-500">{section.description}</p>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springConfig}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30 flex items-center gap-1">
              <Users className="w-3 h-3" />
              Community
            </span>
          </div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 mb-3">Community Feed</h1>
          <p className="text-gray-400 text-lg">Discover ranked content from across the platform</p>
        </motion.div>

        {/* Navigation Hub */}
        <CommunityNavSection />

        {/* Filters */}
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