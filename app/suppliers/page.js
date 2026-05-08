'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { fetchSuppliers } from '@/services/supplierService';
import TrustBadge from '@/components/trust/TrustBadge';

export default function SupplierDiscoveryPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const loadSuppliers = useCallback(async (reset = true) => {
    try {
      if (reset) setLoading(true);
      const result = await fetchSuppliers({
        searchTerm: searchTerm || null,
        location: location || null,
        verifiedOnly,
        page: reset ? 0 : page,
        pageSize: 12,
        sortBy: 'trust',
      });
      if (reset) { setSuppliers(result.suppliers); setPage(0); }
      else setSuppliers(prev => [...prev, ...result.suppliers]);
      setHasMore(result.hasMore);
      setTotal(result.total);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [searchTerm, location, verifiedOnly, page]);

  useEffect(() => { loadSuppliers(true); }, [verifiedOnly]);
  useEffect(() => {
    const t = setTimeout(() => loadSuppliers(true), 300);
    return () => clearTimeout(t);
  }, [searchTerm, location]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 pb-20">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">🏭 Supplier Directory</span>
                <span className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-semibold border border-white/20">{total} Suppliers</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black mb-3">Find Trusted Suppliers</h1>
              <p className="text-emerald-200 text-lg max-w-2xl">Discover verified manufacturers, distributors, and service providers across India. Every supplier is scored for trust and reliability.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/add-product" className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-orange-500/25 flex items-center gap-2">
                <span>📦</span> List Your Business
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        {loading && suppliers.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 animate-pulse border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="flex-1"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" /><div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" /></div>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && suppliers.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏭</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No suppliers found</h3>
            <p className="text-gray-500">Try different search criteria or browse all suppliers.</p>
          </div>
        )}

        {/* Supplier Cards */}
        {suppliers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suppliers.map((supplier) => (
              <div key={supplier.user_id || supplier.id} className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-6 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 hover:-translate-y-1 group flex flex-col">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {(supplier.company_name || supplier.full_name || '?')[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-emerald-600 transition-colors">{supplier.company_name || supplier.full_name || 'Unknown'}</h3>
                    {supplier.full_name && supplier.company_name && <p className="text-sm text-gray-500 truncate">{supplier.full_name}</p>}
                    {supplier.location && <p className="text-xs text-gray-400 mt-0.5">📍 {supplier.location}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <TrustBadge badge={supplier.trustBadge} size="sm" />
                  <span className="text-xs text-gray-400">Score: {supplier.trustScore}/100</span>
                </div>

                {supplier.bio && <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{supplier.bio}</p>}

                <div className="flex flex-wrap gap-2 mb-4 mt-auto">
                  <span className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded-full">📦 {supplier.productCount} products</span>
                  {supplier.responseTime && (
                    <span className={`text-xs px-2 py-1 rounded-full ${supplier.responseTime.speed === 'fast' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                      {supplier.responseTime.speed === 'fast' ? '⚡' : '⏱️'} {supplier.responseTime.speed === 'fast' ? 'Fast response' : 'Responds'}
                    </span>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-700/50 flex gap-2">
                  <Link href={`/suppliers/${supplier.user_id || supplier.id}`} className="flex-1 text-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm">
                    View Profile
                  </Link>
                  {supplier.whatsapp && (
                    <Link href={`https://wa.me/91${String(supplier.whatsapp).replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm">
                      💬
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {hasMore && (
          <div className="text-center mt-10">
            <button onClick={() => { setPage(p => p + 1); loadSuppliers(false); }} className="px-8 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm">
              Load More Suppliers
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
