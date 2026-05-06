// components/ui/AnimatedBackground.js (verify – reduced motion support)
'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

export function AnimatedBackground() {
  const [reduceMotion, setReduceMotion] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mediaQuery.matches);
    const handler = (e) => setReduceMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  if (reduceMotion) return null;

  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -100]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <motion.div style={{ y: y1 }} className="absolute top-0 -left-1/4 w-1/2 h-1/2 rounded-full bg-orange-500/20 blur-[120px]" />
      <motion.div style={{ y: y2 }} className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 rounded-full bg-amber-500/20 blur-[140px]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-white/30 dark:to-black/30" />
    </div>
  );
}