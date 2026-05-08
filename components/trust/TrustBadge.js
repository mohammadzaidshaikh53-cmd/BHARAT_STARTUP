'use client';

// components/trust/TrustBadge.js — Visual trust indicator for product cards and listings

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
    <span
      className={`inline-flex items-center font-medium rounded-full border transition-all ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses[size]}`}
      title={badge.label}
    >
      <span>{badge.icon}</span>
      {showLabel && <span>{badge.label}</span>}
    </span>
  );
}
