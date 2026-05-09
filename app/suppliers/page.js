'use client';

// app/suppliers/page.js — Supplier discovery page
// TanStack Query v5 migrated (lib/queries/supplierQueries.js)

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSupplierList } from '@/lib/queries/supplierQueries';
import TrustBadge from '@/components/trust/TrustBadge';
import { Container } from '@/components/ui/Container';
import { springConfig, staggerDelay } from '@/lib/physics/engine';

// Loading skeleton with shimmer
function SupplierCardSkeleton({ index }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-6 animate-pulse"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
        <div className="flex-1">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </div>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full w-full mb-3" />
      <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-full mb-2" />
      <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-2/3" />
    </motion.div>
  );
}

// Supplier card with physics
function SupplierCard({ supplier, index }) {
  const [isHovered, setIsHovered] = useState(false);
  const trustScore = supplier.trustScore || supplier.trust_score || 0;
  const isVerified = supplier.verification_status === 'verified' || supplier.is_verified;

  const getTrustLevel = (s) => {
    if (s >= 80) return { color: 'emerald', icon: '🛡️', label: 'Trusted' };
    if (s >= 60) return { color: 'green', icon: '✓', label: 'Verified' };
    if (s >= 40) return { color: 'blue', icon: '⚡', label: 'Active' };
    return { color: 'amber', icon: '🌱', label: 'New' };
  };
  const trustLevel = getTrustLevel(trustScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...springConfig, delay: staggerDelay(index, 0.06) }}
      whileHover={{ y: -6, scale: 1.02, transition: springConfig }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-6 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 group flex flex-col relative overflow-hidden"
    >
      <motion.div
        animate={{ opacity: isHovered ? 0.08 : 0 }}
        className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10"
      />
      <div className="relative z-10">
        <div className="flex items-start gap-4 mb-4">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={springConfig}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-lg"
          >
            {(supplier.company_name || supplier.full_name || '?')[0]?.toUpperCase()}
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {supplier.company_name || supplier.full_name || 'Unknown'}
              </h3>
              {isVerified && (
                <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-lg">✓ Verified</span>
              )}
            </div>
            {supplier.full_name && supplier.company_name && (
              <p className="text-sm text-gray-500 truncate">{supplier.full_name}</p>
            )}
            {supplier.location && (
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                <span>📍</span> {supplier.location}
              </p>
            )}
          </div>
        </div>

        {/* Trust badge */}
        <div className="flex items-center gap-2 mb-3">
          <TrustBadge
            badge={{ color: trustLevel.color, icon: trustLevel.icon, label: trustLevel.label }}
            size="sm"
          />
          <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${trustScore}%` }}
              transition={{ ...springConfig, delay: 0.3 + index * 0.06 }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
            />
          </div>
          <span className="text-xs font-semibold text-gray-500">{trustScore}</span>
        </div>

        {supplier.bio && (
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{supplier.bio}</p>
        )}

        <div className="flex flex-wrap gap-2 mb-4 mt-auto">
          <span className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-2.5 py-1 rounded-full font-medium">
            📦 {supplier.productCount || 0} products
          </span>
          {supplier.responseTime && (
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              supplier.responseTime.speed === 'fast'
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              {supplier.responseTime.speed === 'fast' ? '⚡ Fast response' : '⏱️ Responds'}
            </span>
          )}
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-700/50 flex gap-2">
          <Link
            href={`/suppliers/${supplier.user_id || supplier.id}`}
            className="flex-1 text-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-lg hover:shadow-emerald-500/20"
          >
            View Profile
          </Link>
          {supplier.whatsapp && (
            <a
              href={`https://wa.me/91${String(supplier.whatsapp).replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-lg hover:shadow-green-500/20"
            >
              💬
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function SupplierDiscoveryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const { data, isLoading, error, refetch } = useSupplierList({
    searchTerm: searchTerm || undefined,
    location: location || undefined,
    verifiedOnly,
    sortBy: 'trust',
  });

  const suppliers = data?.suppliers || [];
  const total = data?.total || 0;
  const hasMore = data?.hasMore || false;

  // Debounced refetch for search/location
  useEffect(() => {
    const t = setTimeout(() => { refetch(); }, 300);
    return () => clearTimeout(t);
  }, [searchTerm, location]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 pb-20 relative z-10">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 text-white relative overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10"
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
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">🏭 Supplier Directory</span>
                <span className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-semibold border border-white/20">{total} Suppliers</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2 sm:mb-3">Find Trusted Suppliers</h1>
              <p className="text-emerald-200 text-lg max-w-2xl">Discover verified manufacturers, distributors, and service providers across India. Every supplier is scored for trust and reliability.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/add-product" className="px-4 sm:px-6 py-2.5 sm:py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-orange-500/25 flex items-center gap-2 text-sm sm:text-base">
                <span>📦</span> List Your Business
              </Link>
            </div>
          </motion.div>
        </Container>
      </div>

      <Container className="py-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <input type="text" placeholder="🔍 Search suppliers by name or industry..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-5 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-gray-900 dark:text-gray-100 shadow-sm" />
          </div>
          <input type="text" placeholder="📍 Location..." value={location} onChange={(e) => setLocation(e.target.value)} className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm w-full md:w-48" />
          <label className="flex items-center gap-2 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 cursor-pointer shadow-sm whitespace-nowrap">
            <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} className="rounded text-emerald-600" />
            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Verified only</span>
          </label>
        </div>

        {/* Loading */}
        {isLoading && suppliers.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SupplierCardSkeleton key={i} index={i} />
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && suppliers.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏭</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No suppliers found</h3>
            <p className="text-gray-500">Try different search criteria or browse all suppliers.</p>
          </div>
        )}

        {/* Supplier Cards - responsive grid */}
        {suppliers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <AnimatePresence mode="popLayout">
              {suppliers.map((supplier, idx) => (
                <SupplierCard key={supplier.user_id || supplier.id} supplier={supplier} index={idx} />
              ))}
            </AnimatePresence>
          </div>
        )}

              </Container>
    </main>
  );
}
