// components/sections/conversion/HowItWorks.js
'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Search, MessageCircle, Zap } from 'lucide-react';
import { SectionHeader } from '@/components/ui/SectionHeader';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }),
};
const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } };

export default function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const steps = [
    { num: '01', title: 'Discover', desc: 'Browse verified startup products across categories.', icon: Search },
    { num: '02', title: 'Connect', desc: 'Message founders directly via WhatsApp or in-app chat.', icon: MessageCircle },
    { num: '03', title: 'Transact', desc: 'Negotiate and close deals with zero platform fees.', icon: Zap },
  ];
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader eyebrow="How it works" title="Three steps to startup success" />
        <motion.div
          ref={ref}
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-8"
        >
          {steps.map((step, i) => (
            <motion.div key={step.num} variants={fadeUp} custom={i} className="relative text-center md:text-left">
              {i < 2 && <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-[1px] bg-gradient-to-r from-gray-200 dark:from-white/10 to-transparent" />}
              <div className="flex flex-col items-center md:items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-900 dark:text-white">
                  <step.icon className="w-6 h-6" />
                </div>
                <span className="text-5xl font-bold text-gray-100 dark:text-white/5">{step.num}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}