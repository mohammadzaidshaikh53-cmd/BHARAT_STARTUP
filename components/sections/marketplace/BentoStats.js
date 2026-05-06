// components/sections/marketplace/BentoStats.js
'use client';
import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { TrendingUp, MessageCircle, ArrowUpRight, Store, Zap, ArrowRight } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';

const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } };

export default function BentoStats({ products, requests }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const hotCategory = products.reduce((acc, p) => {
    const cat = p.category || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  const topCategory = Object.entries(hotCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Tech';

  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader
          eyebrow="Live Ecosystem"
          title="Everything in real‑time"
          subtitle="A living marketplace where Indian startups showcase innovation and buyers find exactly what they need."
        />
        <motion.div
          ref={ref}
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[200px] md:auto-rows-[180px]"
        >
          {/* Large card – Featured */}
          <GlassCard className="md:col-span-2 md:row-span-2 p-6 flex flex-col justify-between">
            <Link href="/marketplace/trending" className="absolute inset-0 z-10" />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-2">Trending Now</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">What's hot</h3>
              </div>
              <div className="p-2 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-3 mt-6">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {products.slice(0, 4).map((p, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 overflow-hidden">
                      {p.image_url ? <img src={p.image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-orange-100 to-amber-100" />}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold text-gray-900 dark:text-white">{products.length}</span> products
                </p>
              </div>
              <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={isInView ? { width: '65%' } : {}}
                  transition={{ duration: 1.2, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                />
              </div>
            </div>
          </GlassCard>

          {/* Requests card */}
          <GlassCard className="p-6 flex flex-col justify-between">
            <Link href="/marketplace?tab=requests" className="absolute inset-0 z-10" />
            <div className="flex items-start justify-between">
              <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <ArrowUpRight className="w-4 h-4 text-gray-400" />
            </div>
            <div className="mt-auto">
              <p className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">{requests.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Active buyer requests</p>
            </div>
          </GlassCard>

          {/* Top category */}
          <GlassCard className="p-6 flex flex-col justify-between">
            <Store className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <div className="mt-auto">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{topCategory}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Hottest category</p>
            </div>
          </GlassCard>

          {/* CTA banner */}
          <GlassCard className="md:col-span-3 p-6 flex items-center justify-between bg-gradient-to-r from-orange-50/80 to-amber-50/80 dark:from-orange-500/5 dark:to-amber-500/5">
            <Link href="/add-product" className="absolute inset-0 z-10" />
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">Are you a startup founder?</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">List your product and reach verified buyers.</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm font-semibold text-orange-700 dark:text-orange-400">
              Get started <ArrowRight className="w-4 h-4" />
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}