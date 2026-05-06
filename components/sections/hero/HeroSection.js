// components/sections/hero/HeroSection.js
'use client';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Package, Users, Zap, ShieldCheck, Sparkles } from 'lucide-react';

export default function HeroSection({ stats }) {
  const { scrollY } = useScroll();
  const yBg = useTransform(scrollY, [0, 500], [0, 150]);
  const yText = useTransform(scrollY, [0, 500], [0, -80]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-32">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div style={{ y: yBg }} className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-orange-500/20 blur-[130px] animate-pulse" />
        <motion.div style={{ y: yBg }} className="absolute top-[20%] -right-[20%] w-[60%] h-[60%] rounded-full bg-amber-500/20 blur-[110px] animate-pulse" transition={{ delay: 2 }} />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wMykiLz48L3N2Zz4=')] opacity-30 dark:opacity-20" />
      </div>

      <motion.div style={{ opacity, y: yText }} className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 text-orange-700 dark:text-orange-300 text-sm font-medium mb-8"
        >
          <Sparkles className="w-4 h-4" />
          <span>India's startup marketplace is live</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.1]"
        >
          Connect with<br />Indian startups
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mt-6 mb-10 leading-relaxed"
        >
          Discover products from verified founders. Post requirements. Connect directly — zero commissions.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/marketplace" className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full text-sm font-semibold hover:shadow-lg hover:shadow-orange-500/20 transition-all active:scale-[0.97]">
            Explore Marketplace <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link href="/add-request" className="inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-white/5 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-full text-sm font-semibold hover:bg-gray-50 dark:hover:bg-white/10 transition-all">
            Post a Requirement
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
        >
          {[
            { label: 'Products', value: stats.products, icon: Package },
            { label: 'Buyers', value: stats.buyers, icon: Users },
            { label: 'Categories', value: stats.categories, icon: Zap },
            { label: 'Verified', value: stats.verified, icon: ShieldCheck },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center p-4 rounded-2xl bg-white/40 dark:bg-white/[0.03] backdrop-blur-md border border-black/[0.04] dark:border-white/[0.06]">
              <stat.icon className="w-4 h-4 text-orange-600 dark:text-orange-400 mb-2" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                {stat.value?.toLocaleString() || '—'}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}