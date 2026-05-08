'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const springTransition = {
  type: 'spring',
  stiffness: 350,
  damping: 28,
};

export function StatCard({
  label,
  value,
  trend,
  trendValue,
  prefix = '',
  suffix = '',
  icon: Icon,
  loading = false,
  delay = 0,
}) {
  const trendIcons = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus,
  };

  const TrendIcon = trendIcons[trend] || Minus;

  const trendColors = {
    up: 'text-emerald-500',
    down: 'text-red-500',
    neutral: 'text-gray-400',
  };

  if (loading) {
    return (
      <div className="card-premium p-6 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-3" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springTransition, delay }}
      whileHover={{ y: -4, transition: { duration: 0.35 } }}
      className="card-premium p-6 group cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <div className="flex items-baseline gap-1 mt-2">
            {Icon && (
              <Icon className="w-5 h-5 text-muted-foreground mr-1" />
            )}
            <span className="text-2xl font-bold text-foreground">
              {prefix}
              {typeof value === 'number' ? value.toLocaleString() : value}
              {suffix}
            </span>
          </div>

          {trendValue !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${trendColors[trend]}`}>
              <TrendIcon className="w-4 h-4" />
              <span className="font-medium">
                {trend === 'up' && '+'}
                {trendValue}
              </span>
              {trend && (
                <span className="text-muted-foreground text-xs ml-1">vs last period</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Subtle gradient on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  );
}

/**
 * Grid layout for stat cards
 */
export function StatCardGrid({ children, columns = 4 }) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns] || gridCols[4]} gap-4 lg:gap-6`}>
      {children}
    </div>
  );
}
