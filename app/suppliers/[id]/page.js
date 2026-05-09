'use client';

// app/suppliers/[id]/page.js — Supplier detail page
// TanStack Query v5 migrated (lib/queries/supplierQueries.js)

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useSupplierProfile } from '@/lib/queries/supplierQueries';
import TrustCard from '@/components/trust/TrustCard';
import TrustBadge from '@/components/trust/TrustBadge';
import { formatPrice, getRelativeTime } from '@/lib/utils/formatters';

export default function SupplierProfilePage() {
  const params = useParams();
  const { data: supplier, isLoading } = useSupplierProfile(params.id);

  if (isLoading) return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-emerald-200 dark:bg-emerald-800 rounded-full" />
        <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </main>
  );

  if (!supplier) return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Supplier Not Found</h1>
        <Link href="/suppliers" className="text-emerald-600 underline font-medium">Browse Suppliers</Link>
      </div>
    </main>
  );

  const name = supplier.company_name || supplier.full_name || 'Unknown';
  const initial = name[0]?.toUpperCase() || '?';

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link href="/suppliers" className="text-emerald-300 text-sm hover:text-white transition mb-6 inline-block">← Back to Suppliers</Link>
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-black text-2xl shrink-0 shadow-xl">{initial}</div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-black text-white">{name}</h1>
                <TrustBadge badge={supplier.trustBadge} size="md" />
              </div>
              {supplier.full_name && supplier.company_name && <p className="text-emerald-300 mb-1">{supplier.full_name}</p>}
              <div className="flex flex-wrap gap-3 text-sm text-emerald-200">
                {supplier.location && <span>📍 {supplier.location}</span>}
                <span>📦 {supplier.productCount} products</span>
                <span className="flex items-center gap-1"><span className={`w-2 h-2 rounded-full ${supplier.responseTime?.speed === 'fast' ? 'bg-emerald-400' : 'bg-amber-400'}`} /> {supplier.responseTime?.label}</span>
              </div>
            </div>
            {supplier.whatsapp && (
              <Link href={`https://wa.me/91${String(supplier.whatsapp).replace(/\D/g, '')}`} target="_blank" className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all shadow-lg">💬 Contact Supplier</Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Products */}
          <div className="lg:col-span-2 space-y-6">
            {supplier.bio && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">About</h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{supplier.bio}</p>
              </div>
            )}

            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Products ({supplier.productCount})</h2>
              {supplier.products?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {supplier.products.map((product) => (
                    <Link key={product.id} href={`/products/${product.id}`} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all group">
                      {product.image_url ? (
                        <Image src={product.image_url} alt={product.name} width={400} height={160} className="w-full h-36 object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-36 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400">📷</div>
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-emerald-600 transition-colors">{product.name}</h3>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-lg font-bold text-orange-600">₹{formatPrice(product.price)}</span>
                          <span className="text-xs text-gray-400">{getRelativeTime(product.created_at)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 text-center text-gray-500">No products listed yet</div>
              )}
            </div>
          </div>

          {/* Right: Trust Card */}
          <div className="space-y-6">
            <TrustCard trustScore={supplier.trustScore} trustBreakdown={supplier.trustBreakdown} trustBadge={supplier.trustBadge} responseTime={supplier.responseTime} profileCompletion={supplier.profileCompletion} />
          </div>
        </div>
      </div>
    </main>
  );
}
