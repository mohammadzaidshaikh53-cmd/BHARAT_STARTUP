'use client';

// app/dashboard/page.js — Enhanced tabbed dashboard
// Preserves existing delete/manage logic, adds analytics and RFQ tracking

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice, getRelativeTime } from '@/lib/utils/formatters';
import { getRFQStats } from '@/services/rfqService';
import { calculateTrustScore, getProfileCompletionSteps } from '@/lib/trust/trustCalculator';
import TrustBadge from '@/components/trust/TrustBadge';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ products: 0, views: 0, inquiries: 0, rfqActive: 0, rfqTotal: 0 });
  const [trustData, setTrustData] = useState(null);
  const [completion, setCompletion] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [lastDeleted, setLastDeleted] = useState(null);

  const loadData = useCallback(async (userId) => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase.from('seller_profiles').select('*').eq('user_id', userId).maybeSingle();
      setProfile(profileData);

      // Fetch products
      const { data: prods } = await supabase.from('products').select('*, product_stats(*)').eq('seller_id', userId).order('created_at', { ascending: false });
      setProducts(prods || []);

      // Fetch requests/RFQs
      const { data: reqs } = await supabase.from('requests').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      setRequests(reqs || []);

      // Calculate stats
      const totalViews = (prods || []).reduce((s, p) => s + (p.product_stats?.views || 0), 0);
      const totalInquiries = (prods || []).reduce((s, p) => s + (p.product_stats?.inquiries || 0), 0);
      const rfqStats = await getRFQStats(userId);

      setStats({ products: prods?.length || 0, views: totalViews, inquiries: totalInquiries, rfqActive: rfqStats.active, rfqTotal: rfqStats.total });

      // Trust score
      const trust = calculateTrustScore(profileData || {}, prods || []);
      setTrustData(trust);
      setCompletion(getProfileCompletionSteps(profileData || {}));
    } catch (err) { console.error('[Dashboard]', err); }
  }, []);

  useEffect(() => {
    async function init() {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { router.push('/login?redirect=/dashboard'); return; }
      setUser(u);
      await loadData(u.id);
      setLoading(false);
    }
    init();
  }, [router, loadData]);

  const handleDelete = async (productId) => {
    if (!confirm('Remove this product?')) return;
    setDeletingId(productId);
    try {
      const { error } = await supabase.from('products').update({ verification_status: 'rejected', rejection_reason: 'Deleted by owner' }).eq('id', productId).eq('seller_id', user.id);
      if (error) throw error;
      const deleted = products.find(p => p.id === productId);
      setLastDeleted(deleted);
      setProducts(prev => prev.filter(p => p.id !== productId));
      setStats(prev => ({ ...prev, products: prev.products - 1 }));
      setTimeout(() => setLastDeleted(null), 8000);
    } catch (err) { alert('Delete failed: ' + err.message); }
    finally { setDeletingId(null); }
  };

  const handleUndo = async () => {
    if (!lastDeleted) return;
    try {
      await supabase.from('products').update({ verification_status: 'pending', rejection_reason: null }).eq('id', lastDeleted.id).eq('seller_id', user.id);
      setProducts(prev => [lastDeleted, ...prev]);
      setStats(prev => ({ ...prev, products: prev.products + 1 }));
      setLastDeleted(null);
    } catch (err) { alert('Undo failed'); }
  };

  const tabs = [
    { key: 'overview', label: '📊 Overview' },
    { key: 'products', label: `📦 Products (${stats.products})` },
    { key: 'rfqs', label: `📋 RFQs (${stats.rfqActive})` },
  ];

  if (loading) return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-orange-200 dark:bg-orange-800 rounded-xl" />
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black mb-1">Seller Dashboard</h1>
              <p className="text-gray-400">{user?.email}</p>
            </div>
            <div className="flex gap-3">
              <Link href="/add-product" className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-orange-500/25 text-sm">+ Add Product</Link>
              <Link href="/rfq/create" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/25 text-sm">📋 Post RFQ</Link>
              <Link href="/profile" className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all border border-white/20 text-sm">Profile</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${activeTab === t.key ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>{t.label}</button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Products', value: stats.products, icon: '📦', color: 'from-orange-500 to-amber-500' },
                { label: 'Total Views', value: stats.views, icon: '👁️', color: 'from-blue-500 to-cyan-500' },
                { label: 'Inquiries', value: stats.inquiries, icon: '💬', color: 'from-emerald-500 to-green-500' },
                { label: 'Active RFQs', value: stats.rfqActive, icon: '📋', color: 'from-purple-500 to-violet-500' },
              ].map(s => (
                <div key={s.label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{s.icon}</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full bg-gradient-to-r ${s.color} text-white`}>Live</span>
                  </div>
                  <p className="text-3xl font-black text-gray-900 dark:text-gray-100">{s.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Trust + Profile Completion */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trustData && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Your Trust Score</h3>
                    <TrustBadge badge={trustData.badge} size="md" />
                  </div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className={`text-4xl font-black ${trustData.total >= 70 ? 'text-emerald-600' : trustData.total >= 40 ? 'text-amber-600' : 'text-gray-500'}`}>{trustData.total}</span>
                    <span className="text-sm text-gray-500">/100</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${trustData.total >= 70 ? 'bg-emerald-500' : trustData.total >= 40 ? 'bg-amber-500' : 'bg-gray-400'}`} style={{ width: `${trustData.total}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-3">Higher trust scores help your products rank higher in search results</p>
                </div>
              )}

              {completion && completion.percentage < 100 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Complete Your Profile</h3>
                    <span className="text-sm font-bold text-orange-600">{completion.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden mb-4">
                    <div className="h-full rounded-full bg-orange-500 transition-all duration-500" style={{ width: `${completion.percentage}%` }} />
                  </div>
                  <div className="space-y-2">
                    {completion.steps.map(step => (
                      <div key={step.key} className="flex items-center gap-2 text-sm">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${step.completed ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>{step.completed ? '✓' : '○'}</span>
                        <span className={step.completed ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-300'}>{step.label}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/profile" className="mt-4 inline-block text-sm text-orange-600 font-semibold hover:text-orange-700">Complete Profile →</Link>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/suppliers" className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 hover:shadow-lg transition-all group">
                <span className="text-2xl mb-2 block">🏭</span>
                <h4 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-emerald-600 transition-colors">Find Suppliers</h4>
                <p className="text-sm text-gray-500 mt-1">Discover verified suppliers</p>
              </Link>
              <Link href="/rfq" className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 hover:shadow-lg transition-all group">
                <span className="text-2xl mb-2 block">📋</span>
                <h4 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors">Browse RFQs</h4>
                <p className="text-sm text-gray-500 mt-1">Find buyer requirements</p>
              </Link>
              <Link href="/events" className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 hover:shadow-lg transition-all group">
                <span className="text-2xl mb-2 block">🎪</span>
                <h4 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 transition-colors">Events & Expos</h4>
                <p className="text-sm text-gray-500 mt-1">Upcoming trade shows</p>
              </Link>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            {products.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="text-5xl mb-4">📦</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No products yet</h3>
                <Link href="/add-product" className="text-orange-600 font-semibold">Add your first product →</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {products.map(product => (
                  <div key={product.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 flex items-center gap-4 hover:shadow-md transition-all">
                    {product.image_url ? (
                      <Image src={product.image_url} alt={product.name} width={80} height={80} className="w-20 h-20 object-cover rounded-xl shrink-0" />
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-gray-400 shrink-0">📷</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 truncate">{product.name}</h4>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span className="font-semibold text-orange-600">₹{formatPrice(product.price)}</span>
                        <span>{product.category}</span>
                        <span>{getRelativeTime(product.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${product.verification_status === 'verified' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : product.verification_status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'}`}>
                          {product.verification_status === 'verified' ? '✓ Verified' : product.verification_status === 'rejected' ? '✗ Rejected' : '⏳ Pending'}
                        </span>
                        {product.product_stats?.views > 0 && <span className="text-xs text-gray-400">👁 {product.product_stats.views}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Link href={`/products/${product.id}/edit`} className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">✏️ Edit</Link>
                      <button onClick={() => handleDelete(product.id)} disabled={deletingId === product.id} className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-500/10 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-all disabled:opacity-50">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* RFQs Tab */}
        {activeTab === 'rfqs' && (
          <div>
            {requests.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="text-5xl mb-4">📋</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No buyer requests yet</h3>
                <Link href="/rfq/create" className="text-blue-600 font-semibold">Post your first requirement →</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map(req => (
                  <div key={req.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 dark:text-gray-100">{req.title}</h4>
                        <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500">
                          <span className="bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full text-xs">{req.category}</span>
                          {req.location && <span>📍 {req.location}</span>}
                          {req.budget && <span className="font-semibold text-blue-600">₹{formatPrice(req.budget)}</span>}
                          <span>{getRelativeTime(req.created_at)}</span>
                        </div>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${req.is_active ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-gray-100 text-gray-500'}`}>
                        {req.is_active ? '🟢 Active' : '⚪ Closed'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Undo toast */}
      {lastDeleted && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 z-50 animate-fade-in-up">
          <span>🗑️ Product removed</span>
          <button onClick={handleUndo} className="text-orange-400 underline text-sm font-semibold hover:text-orange-300">Undo</button>
        </div>
      )}
    </main>
  );
}