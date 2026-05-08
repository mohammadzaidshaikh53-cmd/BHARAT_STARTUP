'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const springTransition = {
  type: 'spring',
  stiffness: 350,
  damping: 28,
};

export function TrendIndicator({
  value,
  suffix = '%',
  inverse = false,
  showIcon = true,
  size = 'default', // 'sm' | 'default' | 'lg'
  className = '',
}) {
  // Determine trend direction
  const trend = value > 0 ? 'up' : value < 0 ? 'down' : 'neutral';

  // For inverse mode (lower is better)
  const displayValue = inverse && trend !== 'neutral'
    ? (trend === 'up' ? 'down' : 'up')
    : trend;
  const displayIcon = displayValue === 'up' ? TrendingUp : displayValue === 'down' ? TrendingDown : Minus;

  const colors = {
    up: 'text-emerald-500',
    down: 'text-red-500',
    neutral: 'text-gray-400',
  };

  const bgColors = {
    up: 'bg-emerald-500/10',
    down: 'bg-red-500/10',
    neutral: 'bg-gray-500/10',
  };

  const sizes = {
    sm: 'text-xs px-1.5 py-0.5',
    default: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    default: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const Icon = displayIcon;

  return (
    <motion.span
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={springTransition}
      className={`
        inline-flex items-center gap-1 rounded-full font-medium
        ${sizes[size]}
        ${colors[trend]}
        ${bgColors[trend]}
        ${className}
      `}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>
        {trend !== 'neutral' && (trend === 'up' ? '+' : '')}
        {value}{suffix}
      </span>
    </motion.span>
  );
}

/**
 * Compact trend badge for cards
 */
export function TrendBadge({
  value,
  label,
  inverse = false,
}) {
  const trend = value > 0 ? 'up' : value < 0 ? 'down' : 'neutral';
  const displayTrend = inverse && trend !== 'neutral'
    ? (trend === 'up' ? 'down' : 'up')
    : trend;

  const colors = {
    up: 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5',
    down: 'border-red-500/20 text-red-500 bg-red-500/5',
    neutral: 'border-gray-500/20 text-gray-500 bg-gray-500/5',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springTransition}
      className={`
        inline-flex flex-col items-start px-3 py-2 rounded-xl border
        ${colors[displayTrend]}
      `}
    >
      <TrendIndicator value={value} size="sm" />
      {label && (
        <span className="text-xs mt-1 opacity-70">{label}</span>
      )}
    </motion.div>
  );
}
