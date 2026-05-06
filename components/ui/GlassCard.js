'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const scaleUp = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};

export function GlassCard({ children, className, hover = true, onClick }) {
  const spring = { type: 'spring', stiffness: 300, damping: 20 };
  return (
    <motion.div
      variants={scaleUp}
      whileHover={hover ? { y: -6, transition: spring } : {}}
      whileTap={hover ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-colors cursor-pointer',
        'bg-white/60 dark:bg-white/[0.03] border-black/[0.04] dark:border-white/[0.06]',
        'shadow-sm hover:shadow-lg dark:shadow-none',
        className
      )}
    >
      {children}
    </motion.div>
  );
}