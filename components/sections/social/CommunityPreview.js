// components/sections/social/CommunityPreview.js
'use client';

import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { MessageCircle, Heart, Sparkles, ArrowRight, Star } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';   // ✅ added missing import

// Mock data – replace with real data from Supabase later
const testimonials = [
  {
    id: '1',
    name: 'Priya Sharma',
    role: 'Founder, EcoCart',
    avatar: null,
    content: 'Bharat Startup helped us find 5 new B2B buyers within a week. The direct WhatsApp connect is a game changer!',
    rating: 5,
  },
  {
    id: '2',
    name: 'Rahul Mehta',
    role: 'Procurement Head, TechCorp',
    avatar: null,
    content: 'We sourced our entire office furniture through verified sellers here. Zero middlemen, seamless experience.',
    rating: 5,
  },
  {
    id: '3',
    name: 'Anjali Nair',
    role: 'Founder, Artisan Alley',
    avatar: null,
    content: 'As a handmade products seller, this platform gave us direct access to premium buyers across India.',
    rating: 4,
  },
];

const recentActivity = [
  { id: '1', type: 'product', user: 'Sunil K.', action: 'listed a new product', target: 'Smart LED Bulbs', time: '2 mins ago' },
  { id: '2', type: 'request', user: 'Meera I.', action: 'posted a requirement for', target: 'Eco‑friendly packaging', time: '15 mins ago' },
  { id: '3', type: 'deal', user: 'Rohit S.', action: 'closed a deal on', target: 'Industrial printer', time: '1 hour ago' },
];

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function CommunityPreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [activeTab, setActiveTab] = useState('testimonials'); // 'testimonials' or 'activity'

  return (
    <section ref={ref} className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader
          eyebrow="Community"
          title="What the community is saying"
          subtitle="Join thousands of founders and buyers already growing on Bharat Startup"
        />

        {/* Tab switcher */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
            <button
              onClick={() => setActiveTab('testimonials')}
              className={cn(
                'px-6 py-2 rounded-full text-sm font-medium transition-all',
                activeTab === 'testimonials'
                  ? 'bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              )}
            >
              Testimonials
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={cn(
                'px-6 py-2 rounded-full text-sm font-medium transition-all',
                activeTab === 'activity'
                  ? 'bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              )}
            >
              Live Activity
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'testimonials' && (
            <motion.div
              key="testimonials"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.id}
                  variants={fadeUp}
                  initial="hidden"
                  animate={isInView ? 'visible' : 'hidden'}
                  transition={{ delay: i * 0.1 }}
                >
                  <GlassCard className="p-6 h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar name={t.name} src={t.avatar} size={48} />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{t.name}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t.role}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'w-4 h-4',
                            i < t.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed flex-1">“{t.content}”</p>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto space-y-3"
            >
              {recentActivity.map((act, i) => (
                <motion.div
                  key={act.id}
                  variants={fadeUp}
                  initial="hidden"
                  animate={isInView ? 'visible' : 'hidden'}
                  transition={{ delay: i * 0.1 }}
                >
                  <GlassCard className="p-4 flex items-center gap-3 hover:shadow-md transition">
                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400">
                      {act.type === 'product' && <Sparkles className="w-5 h-5" />}
                      {act.type === 'request' && <MessageCircle className="w-5 h-5" />}
                      {act.type === 'deal' && <Heart className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-semibold">{act.user}</span> {act.action}{' '}
                        <span className="font-medium text-orange-600 dark:text-orange-400">{act.target}</span>
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{act.time}</p>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
              <div className="text-center mt-6">
                <Button variant="secondary" size="sm" onClick={() => window.location.href = '/marketplace'}>
                  Join the community <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}