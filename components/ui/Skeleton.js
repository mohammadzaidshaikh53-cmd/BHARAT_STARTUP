// components/ui/Skeleton.js — Standardized skeleton loaders
'use client';

import { motion } from 'framer-motion';
import { staggerDelay } from '@/lib/physics/engine';

// Card skeleton
export function CardSkeleton({ index = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: staggerDelay(index) }}
      className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-5 sm:p-6 animate-pulse ${className}`}
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-200 dark:bg-gray-700 rounded-xl sm:rounded-2xl shrink-0" />
        <div className="flex-1">
          <div className="h-4 sm:h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded w-full" />
        <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded w-2/3" />
      </div>
      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
        <div className="h-8 bg-gray-100 dark:bg-gray-600 rounded-lg w-1/3" />
        <div className="h-8 bg-gray-100 dark:bg-gray-600 rounded-lg w-1/4" />
      </div>
    </motion.div>
  );
}

// Grid skeleton for card layouts
export function CardGridSkeleton({ count = 6, columns = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3', gap = 'gap-4 sm:gap-6' }) {
  return (
    <div className={`grid ${columns} ${gap}`}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} index={i} />
      ))}
    </div>
  );
}

// List skeleton
export function ListSkeleton({ count = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: staggerDelay(i) }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 p-4 animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg shrink-0" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-1.5" />
              <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded w-1/3" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Stat card skeleton
export function StatSkeleton({ index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: staggerDelay(index) }}
      className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-4 sm:p-5 animate-pulse"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        <div className="w-12 h-4 bg-gray-100 dark:bg-gray-700 rounded" />
      </div>
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
      <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded w-1/3" />
    </motion.div>
  );
}

// Stats grid skeleton
export function StatsGridSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <StatSkeleton key={i} index={i} />
      ))}
    </div>
  );
}
