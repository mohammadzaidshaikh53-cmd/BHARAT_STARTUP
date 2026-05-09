'use client';

// app/rfq/page.js — Public RFQ marketplace listing
// Reuses existing 'requests' table via rfqService
// TanStack Query v5 migrated (lib/queries/rfqQueries.js)

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRFQList } from '@/lib/queries/rfqQueries';
import { formatCurrency, getRelativeTime, getLocationColor } from '@/lib/utils/formatters';
import { Container } from '@/components/ui/Container';
import { springConfig, staggerDelay } from '@/lib/physics/engine';
import { supabase } from '@/lib/supabase';

const CATEGORIES = ['All', 'Food', 'Fitness', 'Tech', 'Services', 'Handloom', 'Electronics'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'budget-high', label: 'Highest Budget' },
  { value: 'budget-low', label: 'Lowest Budget' },
];

// RFQ Card with physics + trust indicators
function RFQCard({ rfq, index }) {
  const [isHovered, setIsHovered] = useState(false);
  const urgencyScore = getUrgencyScore(rfq);
  const isUrgent = urgencyScore >= 70;
  const isHighBudget = rfq.budget >= 100000;
  const hasWhatsApp = !!rfq.whatsapp;
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const isOwner = user && rfq.user_id === user.id;

  return (
    <motion.div
      key={rfq.id}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...springConfig, delay: staggerDelay(index) }}
      whileHover={{ y: -6, scale: 1.01, transition: springConfig }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-5 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 group flex flex-col relative overflow-hidden"
    >
      {/* Urgency glow */}
      {isUrgent && (
        <motion.div
          animate={{ opacity: isHovered ? 0.15 : 0.08 }}
          className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/5"
        />
      )}

      <div className="relative z-10">
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs px-2.5 py-1 rounded-full font-medium border border-blue-100 dark:border-blue-500/20">
              {rfq.category || 'General'}
            </span>
            {isUrgent && (
              <span className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                🔥 Urgent
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400">{getRelativeTime(rfq.created_at)}</span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {rfq.title}
        </h3>

        {/* Description */}
        {rfq.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{rfq.description}</p>
        )}

        {/* Tags row */}
        <div className="flex flex-wrap gap-2 mb-3">
          {rfq.location && (
            <span className={`text-xs px-2 py-1 rounded-full ${getLocationColor(rfq.location)}`}>
              📍 {rfq.location}
            </span>
          )}
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            rfq.is_active
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
          }`}>
            {rfq.is_active ? '🟢 Active' : '⚪ Closed'}
          </span>
          {rfq.quote_count > 0 && (
            <span className="text-xs px-2 py-1 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 font-medium">
              💬 {rfq.quote_count} quotes
            </span>
          )}
        </div>

        {/* Budget + Action */}
        <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <span className="text-xs text-gray-400 block">Budget</span>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-black ${isHighBudget ? 'text-emerald-600' : 'text-blue-600'}`}>
                {rfq.budget ? formatCurrency(rfq.budget) : 'Negotiable'}
              </span>
              {isHighBudget && (
                <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded font-bold">
                  HIGH
                </span>
              )}
            </div>
          </div>
          {isOwner ? (
            <Link
              href={`/rfq/${rfq.id}`}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
            >
              View & Manage
            </Link>
          ) : hasWhatsApp ? (
            <a
              href={`https://wa.me/91${String(rfq.whatsapp).replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20"
            >
              Send Quote
            </a>
          ) : (
            <Link
              href={`/rfq/${rfq.id}/quote`}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20"
            >
              Submit Quote
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Urgency scoring helper
function getUrgencyScore(rfq) {
  if (!rfq.is_active) return 0;
  const daysOld = (Date.now() - new Date(rfq.created_at).getTime()) / (1000 * 60 * 60 * 24);
  if (daysOld <= 1) return 100;
  if (daysOld <= 3) return 80;
  if (daysOld <= 7) return 60;
  if (daysOld <= 14) return 40;
  return 20;
}

// Loading skeleton
function RFQCardSkeleton({ index }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: staggerDelay(index, 0.05) }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-5 animate-pulse border border-gray-100 dark:border-gray-700"
    >
      <div className="flex justify-between mb-3">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
      </div>
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
      <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-full mb-2" />
      <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-2/3 mb-4" />
      <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded w-1/3" />
    </motion.div>
  );
}

export default function RFQMarketplacePage() {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => listener?.subscription.unsubscribe();
  }, []);

  const { data, isLoading, error, refetch } = useRFQList({
    category: category === 'All' ? null : category,
    searchTerm: searchTerm || null,
    sortBy,
    page: 0,
    pageSize: 18,
  });

  const rfqs = data?.rfqs || [];
  const total = data?.total || 0;
  const hasMore = data?.hasMore || false;

  useEffect(() => {
    const timer = setTimeout(() => {
      refetch({ throwOnError: true }).catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 pb-20 relative z-10">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 text-white relative overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10"
        />
        <Container className="py-12 md:py-16 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springConfig}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-6"
          >
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30">
                  📋 RFQ Marketplace
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                  {total} Active Requests
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2 sm:mb-3">
                Buyer Requests & RFQs
              </h1>
              <p className="text-blue-200 text-sm sm:text-lg max-w-2xl">
                Browse active buyer requirements. Find opportunities to supply products and services to businesses across India.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Link
                href="/rfq/create"
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-orange-500/25 flex items-center justify-center gap-2 text-sm"
              >
                <span>📝</span> Post a Requirement
              </Link>
              <Link
                href="/suppliers"
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold transition-all border border-white/20 text-sm text-center"
              >
                Find Suppliers
              </Link>
            </div>
          </motion.div>
        </Container>
      </div>

      <Container className="py-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="🔍 Search requirements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-5 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 shadow-sm"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Category pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springConfig}
          className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide"
        >
          {CATEGORIES.map((cat, i) => (
            <motion.button
              key={cat}
              onClick={() => setCategory(cat)}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </motion.div>

        {/* Loading */}
        {isLoading && rfqs.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <RFQCardSkeleton key={i} index={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error?.message || error}</p>
            <button onClick={() => refetch()} className="px-6 py-2 bg-blue-600 text-white rounded-xl">
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && rfqs.length === 0 && !error && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No buyer requests found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? `No results for "${searchTerm}"` : 'Be the first to post a requirement!'}
            </p>
            <Link href="/rfq/create" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold">
              Post a Requirement
            </Link>
          </div>
        )}

        {/* RFQ Cards - responsive grid */}
        {rfqs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <AnimatePresence mode="popLayout">
              {rfqs.map((rfq, idx) => (
                <RFQCard key={rfq.id} rfq={rfq} index={idx} />
              ))}
            </AnimatePresence>
          </div>
        )}

              </Container>
    </main>
  );
}
