'use client';

// components/trust/TrustBadge.js — Visual trust indicator for product cards and listings
import { motion } from 'framer-motion';

const springConfig = { type: 'spring', stiffness: 350, damping: 28 };

export default function TrustBadge({ badge, size = 'sm', showLabel = true }) {
  if (!badge) return null;

  const colorMap = {
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-500/20',
      ring: 'ring-emerald-500/20',
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-500/10',
      text: 'text-green-700 dark:text-green-400',
      border: 'border-green-200 dark:border-green-500/20',
      ring: 'ring-green-500/20',
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-500/20',
      ring: 'ring-blue-500/20',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-500/20',
      ring: 'ring-amber-500/20',
    },
    gray: {
      bg: 'bg-gray-50 dark:bg-gray-500/10',
      text: 'text-gray-600 dark:text-gray-400',
      border: 'border-gray-200 dark:border-gray-500/20',
      ring: 'ring-gray-500/20',
    },
  };

  const colors = colorMap[badge.color] || colorMap.gray;
  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5 gap-0.5',
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2',
  };

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={springConfig}
      whileHover={{ scale: 1.1, transition: springConfig }}
      className={`inline-flex items-center font-medium rounded-full border transition-all ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses[size]}`}
      title={badge.label}
    >
      <span>{badge.icon}</span>
      {showLabel && <span>{badge.label}</span>}
    </motion.span>
  );
}

// Trust score ring with animated progress
export function TrustScoreRing({ score, size = 80, strokeWidth = 6, showLabel = true }) {
  const getTrustLevel = (s) => {
    if (s >= 90) return { label: 'Excellent', color: '#10b981' };
    if (s >= 70) return { label: 'Good', color: '#3b82f6' };
    if (s >= 50) return { label: 'Fair', color: '#f59e0b' };
    return { label: 'New', color: '#94a3b8' };
  };
  const level = getTrustLevel(score);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={springConfig}
      className="inline-flex items-center gap-3"
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-gray-200 dark:text-gray-700" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={level.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-black text-gray-900 dark:text-gray-100">{score}</span>
        </div>
      </div>
      {showLabel && (
        <div>
          <span className="text-xs text-gray-500 font-medium block">Trust Score</span>
          <span className="font-bold" style={{ color: level.color }}>{level.label}</span>
        </div>
      )}
    </motion.div>
  );
}

// Compact trust indicator bar
export function TrustBar({ score, className = '' }) {
  const getColor = (s) => {
    if (s >= 80) return 'emerald';
    if (s >= 60) return 'green';
    if (s >= 40) return 'blue';
    return 'amber';
  };
  const color = getColor(score);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ ...springConfig, duration: 0.8 }}
          className={`h-full bg-gradient-to-r from-${color}-400 to-${color}-500 rounded-full`}
          style={{
            background: color === 'emerald' ? 'linear-gradient(to right, #34d399, #10b981)' :
                        color === 'green' ? 'linear-gradient(to right, #4ade80, #22c55e)' :
                        color === 'blue' ? 'linear-gradient(to right, #60a5fa, #3b82f6)' :
                        'linear-gradient(to right, #fbbf24, #f59e0b)'
          }}
        />
      </div>
      <span className="text-xs font-bold text-gray-500">{score}</span>
    </div>
  );
}
