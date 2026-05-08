'use client';

// app/rfq/page.js — Public RFQ marketplace listing
// Reuses existing 'requests' table via rfqService

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { fetchRFQs } from '@/services/rfqService';
import { formatCurrency, getRelativeTime, getLocationColor } from '@/lib/utils/formatters';

const CATEGORIES = ['All', 'Food', 'Fitness', 'Tech', 'Services', 'Handloom', 'Electronics'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'budget-high', label: 'Highest Budget' },
  { value: 'budget-low', label: 'Lowest Budget' },
];

export default function RFQMarketplacePage() {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const loadRFQs = useCallback(async (reset = true) => {
    try {
      if (reset) setLoading(true);
      const result = await fetchRFQs({
        category: category === 'All' ? null : category,
        searchTerm: searchTerm || null,
        sortBy,
        page: reset ? 0 : page,
        pageSize: 12,
      });
      if (reset) {
        setRfqs(result.rfqs);
        setPage(0);
      } else {
        setRfqs((prev) => [...prev, ...result.rfqs]);
      }
      setHasMore(result.hasMore);
      setTotal(result.total);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [category, searchTerm, sortBy, page]);

  useEffect(() => {
    loadRFQs(true);
  }, [category, sortBy]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== undefined) loadRFQs(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadRFQs(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 pb-20">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30">
                  📋 RFQ Marketplace
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                  {total} Active Requests
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black mb-3">
                Buyer Requests & RFQs
              </h1>
              <p className="text-blue-200 text-lg max-w-2xl">
                Browse active buyer requirements. Find opportunities to supply products and services to businesses across India.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/rfq/create"
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-orange-500/25 flex items-center gap-2"
              >
                <span>📝</span> Post a Requirement
              </Link>
              <Link
                href="/suppliers"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold transition-all border border-white/20"
              >
                Find Suppliers
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-blue-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && rfqs.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 animate-pulse border border-gray-100 dark:border-gray-700">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4" />
                <div className="flex gap-2 mb-4">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
                </div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button onClick={() => loadRFQs(true)} className="px-6 py-2 bg-blue-600 text-white rounded-xl">
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

        {/* RFQ Cards */}
        {rfqs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rfqs.map((rfq) => (
              <div
                key={rfq.id}
                className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-6 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 hover:-translate-y-1 group flex flex-col"
              >
                {/* Category & time */}
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs px-2.5 py-1 rounded-full font-medium border border-blue-100 dark:border-blue-500/20">
                    {rfq.category || 'General'}
                  </span>
                  <span className="text-xs text-gray-400">{getRelativeTime(rfq.created_at)}</span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {rfq.title}
                </h3>

                {/* Description */}
                {rfq.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{rfq.description}</p>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {rfq.location && (
                    <span className={`text-xs px-2 py-1 rounded-full ${getLocationColor(rfq.location)}`}>
                      📍 {rfq.location}
                    </span>
                  )}
                  <span className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded-full">
                    🏷️ {rfq.is_active ? 'Active' : 'Closed'}
                  </span>
                </div>

                {/* Budget */}
                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-400 block">Budget</span>
                    <span className="text-xl font-black text-blue-600">
                      {rfq.budget ? formatCurrency(rfq.budget) : 'Negotiable'}
                    </span>
                  </div>
                  <Link
                    href={rfq.whatsapp ? `https://wa.me/91${String(rfq.whatsapp).replace(/\D/g, '')}` : '#'}
                    target={rfq.whatsapp ? '_blank' : undefined}
                    rel={rfq.whatsapp ? 'noopener noreferrer' : undefined}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      rfq.whatsapp
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                    onClick={(e) => { if (!rfq.whatsapp) e.preventDefault(); }}
                  >
                    💬 Send Quote
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="text-center mt-10">
            <button
              onClick={loadMore}
              className="px-8 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
            >
              Load More Requests
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
