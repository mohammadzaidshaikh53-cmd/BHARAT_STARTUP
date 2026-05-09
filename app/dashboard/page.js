'use client';

// app/dashboard/page.js — Enterprise dashboard with operational intelligence
// TanStack Query v5 migrated for RFQ stats + quotes

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice, getRelativeTime } from '@/lib/utils/formatters';
import { useRFQStats, useMyQuotes } from '@/lib/queries/rfqQueries';
import { calculateTrustScore, getProfileCompletionSteps } from '@/lib/trust/trustCalculator';
import TrustBadge, { TrustScoreRing } from '@/components/trust/TrustBadge';
import { Container } from '@/components/ui/Container';
import {
  TrendingUp,
  TrendingDown,
  Eye,
  MessageSquare,
  Package,
  FileText,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingFlat,
  Percent,
  BarChart3,
} from 'lucide-react';

const springConfig = { type: 'spring', stiffness: 350, damping: 28 };

// Animated counter hook
function useAnimatedCounter(target, duration = 1000) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setValue(target); clearInterval(timer); }
      else setValue(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

// Stat card with physics
function StatCard({ label, value, icon: Icon, color, trend, delay = 0 }) {
  const animatedValue = useAnimatedCounter(value);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...springConfig, delay }}
      whileHover={{ y: -6, scale: 1.02, transition: springConfig }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-5 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 backdrop-blur-sm relative overflow-hidden"
    >
      <motion.div
        animate={{ opacity: isHovered ? 0.3 : 0 }}
        className={`absolute inset-0 bg-gradient-to-br ${color}`}
      />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <motion.div
            whileHover={{ rotate: 15, scale: 1.1 }}
            transition={springConfig}
            className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-lg`}
          >
            <Icon className="w-5 h-5" />
          </motion.div>
          {trend !== undefined && (
            <span className={`flex items-center gap-1 text-xs font-semibold ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
        <p className="text-3xl font-black text-gray-900 dark:text-gray-100">{animatedValue.toLocaleString()}</p>
        <p className="text-sm text-gray-500 mt-1 font-medium">{label}</p>
      </div>
    </motion.div>
  );
}

// Trust score card with animated ring
function TrustScoreCard({ score, delay = 0 }) {
  const getTrustLevel = (s) => {
    if (s >= 90) return { label: 'Excellent', color: '#10b981' };
    if (s >= 70) return { label: 'Good', color: '#3b82f6' };
    if (s >= 50) return { label: 'Fair', color: '#f59e0b' };
    return { label: 'New', color: '#94a3b8' };
  };
  const level = getTrustLevel(score);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...springConfig, delay }}
      className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-6 backdrop-blur-sm"
    >
      <div className="flex items-center gap-4">
        <TrustScoreRing score={score} size={80} strokeWidth={6} showLabel={false} />
        <div className="flex-1">
          <span className="text-xs text-gray-500 font-medium">Trust Score</span>
          <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100">{score}/100</h3>
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full mt-1" style={{ backgroundColor: `${level.color}15`, color: level.color }}>
            <Award className="w-3 h-3" />
            {level.label}
          </span>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-4">Higher trust scores help your products rank higher in search results</p>
    </motion.div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ products: 0, views: 0, inquiries: 0, rfqActive: 0, rfqTotal: 0 });
  const [operationalMetrics, setOperationalMetrics] = useState({
    inquiryRate: 0,
    avgViewsPerProduct: 0,
    verifiedProducts: 0,
    pendingVerification: 0,
    responseRate: 0,
    rfqResponseRate: 0,
  });
  const [trustData, setTrustData] = useState(null);
  const [completion, setCompletion] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [lastDeleted, setLastDeleted] = useState(null);

  // TanStack Query v5 — RFQ stats + quotes
  const userId = user?.id || null;
  const { data: rfqStatsData } = useRFQStats(userId);
  const { data: quotesData, isLoading: quotesLoading } = useMyQuotes();
  const quotes = quotesData?.quotes || [];

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
      // Calculate stats — rfqStats from TanStack Query
      setStats({ products: prods?.length || 0, views: totalViews, inquiries: totalInquiries, rfqActive: rfqStatsData?.active || 0, rfqTotal: rfqStatsData?.total || 0 });

      // Operational intelligence metrics
      const verifiedCount = (prods || []).filter(p => p.verification_status === 'verified').length;
      const pendingCount = (prods || []).filter(p => p.verification_status === 'pending').length;
      const avgViews = prods?.length ? Math.round(totalViews / prods.length) : 0;
      const inquiryRate = totalViews > 0 ? Math.round((totalInquiries / totalViews) * 100) : 0;
      const activeRFQs = reqs?.filter(r => r.is_active).length || 0;
      const respondedRFQs = reqs?.filter(r => r.responses_count > 0).length || 0;
      const rfqResponseRate = activeRFQs > 0 ? Math.round((respondedRFQs / activeRFQs) * 100) : 0;

      setOperationalMetrics({
        inquiryRate,
        avgViewsPerProduct: avgViews,
        verifiedProducts: verifiedCount,
        pendingVerification: pendingCount,
        responseRate: 0, // placeholder for future WhatsApp response tracking
        rfqResponseRate,
      });

      // Trust score
      const trust = calculateTrustScore(profileData || {}, prods || []);
      setTrustData(trust);
      setCompletion(getProfileCompletionSteps(profileData || {}));
    } catch (err) { console.error('[Dashboard]', err); }
  }, []);

  // Sync rfqStats from TanStack Query into stats state
  useEffect(() => {
    setStats(prev => ({ ...prev, rfqActive: rfqStatsData?.active || 0, rfqTotal: rfqStatsData?.total || 0 }));
  }, [rfqStatsData]);

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
    { key: 'rfqs', label: `📋 My RFQs (${stats.rfqActive})` },
    { key: 'quotes', label: '💰 My Quotes' },
  ];

  // Load quotes only when tab is switched — now via TanStack Query (useMyQuotes)

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
        {/* Tabs with Physics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springConfig}
          className="flex gap-2 mb-8 overflow-x-auto pb-2"
        >
          {tabs.map((t, i) => (
            <motion.button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all relative overflow-hidden ${
                activeTab === t.key
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-purple-500/30'
              }`}
            >
              {t.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid with Physics - responsive 2→4 cols */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard label="Products" value={stats.products} icon={Package} color="from-orange-500 to-amber-500" trend={12} delay={0} />
              <StatCard label="Total Views" value={stats.views} icon={Eye} color="from-blue-500 to-cyan-500" trend={8} delay={0.1} />
              <StatCard label="Inquiries" value={stats.inquiries} icon={MessageSquare} color="from-emerald-500 to-green-500" trend={-3} delay={0.2} />
              <StatCard label="Active RFQs" value={stats.rfqActive} icon={FileText} color="from-purple-500 to-violet-500" delay={0.3} />
            </div>

            {/* Operational Intelligence Panel - responsive grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springConfig, delay: 0.35 }}
              className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-4 sm:p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100">Operational Metrics</h3>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
                {/* Inquiry Rate */}
                <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="text-lg sm:text-2xl font-black text-emerald-600">{operationalMetrics.inquiryRate}%</div>
                  <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Inquiry Rate</div>
                </div>
                {/* Avg Views/Product */}
                <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="text-lg sm:text-2xl font-black text-blue-600">{operationalMetrics.avgViewsPerProduct}</div>
                  <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Avg Views/Prod</div>
                </div>
                {/* Verified Products */}
                <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="text-lg sm:text-2xl font-black text-emerald-600">{operationalMetrics.verifiedProducts}</div>
                  <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Verified</div>
                </div>
                {/* Pending Verification */}
                <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className={`text-lg sm:text-2xl font-black ${operationalMetrics.pendingVerification > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
                    {operationalMetrics.pendingVerification}
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Pending</div>
                </div>
                {/* RFQ Response Rate */}
                <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className={`text-lg sm:text-2xl font-black ${operationalMetrics.rfqResponseRate >= 50 ? 'text-emerald-600' : operationalMetrics.rfqResponseRate > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
                    {operationalMetrics.rfqResponseRate}%
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">RFQ Response</div>
                </div>
                {/* Total Products */}
                <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="text-lg sm:text-2xl font-black text-purple-600">{stats.products}</div>
                  <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Total Listings</div>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between flex-col sm:flex-row gap-2">
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-gray-500 text-xs">Verified listings improve trust scores</span>
                </div>
                <Link href="/profile" className="text-xs text-orange-600 font-semibold hover:text-orange-700 whitespace-nowrap">
                  View Trust Details →
                </Link>
              </div>
            </motion.div>

            {/* Trust + Profile Completion - responsive grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {trustData && <TrustScoreCard score={trustData.total} delay={0.4} />}

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

            {/* Quick Actions with Physics - responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {[
                { href: '/suppliers', emoji: '🏭', title: 'Find Suppliers', desc: 'Discover verified suppliers', color: 'from-emerald-500 to-teal-500' },
                { href: '/rfq', emoji: '📋', title: 'Browse RFQs', desc: 'Find buyer requirements', color: 'from-blue-500 to-cyan-500' },
                { href: '/events', emoji: '🎪', title: 'Events & Expos', desc: 'Upcoming trade shows', color: 'from-purple-500 to-pink-500' },
              ].map((action, i) => (
                <motion.div
                  key={action.href}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...springConfig, delay: 0.5 + i * 0.1 }}
                  whileHover={{ y: -4, transition: springConfig }}
                >
                  <Link href={action.href} className="block bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-5 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 group">
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      transition={springConfig}
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white text-xl mb-3 shadow-lg`}
                    >
                      {action.emoji}
                    </motion.div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{action.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{action.desc}</p>
                  </Link>
                </motion.div>
              ))}
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
                {products.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...springConfig, delay: idx * 0.05 }}
                    whileHover={{ x: 4, scale: 1.01, transition: springConfig }}
                    className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-4 flex items-center gap-4 hover:shadow-lg transition-all duration-300"
                  >
                    {product.image_url ? (
                      <motion.div whileHover={{ scale: 1.1 }} transition={springConfig} className="shrink-0">
                        <Image src={product.image_url} alt={product.name} width={80} height={80} className="w-20 h-20 object-cover rounded-xl" />
                      </motion.div>
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
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link href={`/products/${product.id}/edit`} className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all inline-block">✏️ Edit</Link>
                      </motion.div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingId === product.id}
                        className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-500/10 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-all disabled:opacity-50"
                      >🗑️</motion.button>
                    </div>
                  </motion.div>
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

        {/* Quotes Tab */}
        {activeTab === 'quotes' && (
          <div>
            {quotesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 animate-pulse border border-gray-100 dark:border-gray-700">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3" />
                    <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-1/2 mb-2" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : quotes.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="text-5xl mb-4">💰</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No quotes submitted</h3>
                <p className="text-gray-500 mb-4">Browse active RFQs and submit quotes to win business.</p>
                <Link href="/rfq" className="text-orange-600 font-semibold">Browse RFQs →</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {quotes.map((quote, idx) => (
                  <motion.div
                    key={quote.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...springConfig, delay: idx * 0.05 }}
                    className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-4 flex items-center gap-4 hover:shadow-lg transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                      ₹
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-900 dark:text-gray-100 truncate">
                          {quote.rfq?.title || 'RFQ Quote'}
                        </h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          quote.status === 'submitted' ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' :
                          quote.status === 'shortlisted' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                          quote.status === 'awarded' ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {quote.status === 'submitted' ? '📨 Pending' :
                           quote.status === 'shortlisted' ? '⭐ Shortlisted' :
                           quote.status === 'awarded' ? '🏆 Awarded' :
                           '✗ Rejected'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="font-semibold text-emerald-600">₹{Number(quote.price).toLocaleString('en-IN')}/{quote.unit || 'unit'}</span>
                        {quote.lead_time_days && <span>⏱️ {quote.lead_time_days} days</span>}
                        {quote.moq && <span>📦 MOQ: {quote.moq}</span>}
                        <span>{getRelativeTime(quote.created_at)}</span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <Link
                        href={`/rfq/${quote.rfq_id}`}
                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                      >
                        View RFQ
                      </Link>
                    </div>
                  </motion.div>
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