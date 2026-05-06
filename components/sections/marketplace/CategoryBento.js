// components/sections/marketplace/CategoryBento.js
'use client';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useInView } from 'framer-motion';
import { Zap, Store, TrendingUp, Sparkles, ShieldCheck } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { cn } from '@/lib/utils';

const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } };

export default function CategoryBento() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const router = useRouter();

  const categories = [
    { name: 'Tech', slug: 'Tech', count: '120+', color: 'from-blue-500/20 to-cyan-500/20', icon: Zap, col: 'md:col-span-2', row: 'md:row-span-2' },
    { name: 'Food', slug: 'Food', count: '85+', color: 'from-orange-500/20 to-amber-500/20', icon: Store },
    { name: 'Fitness', slug: 'Fitness', count: '64+', color: 'from-emerald-500/20 to-green-500/20', icon: TrendingUp },
    { name: 'Handloom', slug: 'Handloom', count: '42+', color: 'from-rose-500/20 to-pink-500/20', icon: Sparkles },
    { name: 'Services', slug: 'Services', count: '93+', color: 'from-violet-500/20 to-purple-500/20', icon: ShieldCheck, col: 'md:col-span-2' },
  ];

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader
          eyebrow="Browse"
          title="Explore by category"
          subtitle="From tech innovation to heritage handloom — find startups building across every sector."
        />
        <motion.div
          ref={ref}
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[180px]"
        >
          {categories.map((cat) => (
            <GlassCard
              key={cat.name}
              className={cn('p-6 flex flex-col justify-between', cat.col, cat.row)}
              onClick={() => router.push(`/marketplace?category=${cat.slug}`)}
            >
              <div className={cn('absolute inset-0 bg-gradient-to-br opacity-50 dark:opacity-30', cat.color)} />
              <div className="relative z-10 flex items-start justify-between">
                <div className="p-2.5 rounded-xl bg-white/60 dark:bg-white/10 backdrop-blur-md">
                  <cat.icon className="w-5 h-5 text-gray-900 dark:text-white" />
                </div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-white/60 dark:bg-white/5 backdrop-blur-md px-2.5 py-1 rounded-full">
                  {cat.count}
                </span>
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{cat.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Explore →</p>
              </div>
            </GlassCard>
          ))}
        </motion.div>
      </div>
    </section>
  );
}