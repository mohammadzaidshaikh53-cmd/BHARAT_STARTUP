'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

const springTransition = {
  type: 'spring',
  stiffness: 350,
  damping: 28,
};

export function ProgressRing({
  value = 0,
  max = 100,
  size = 80,
  strokeWidth = 8,
  color = 'currentColor',
  bgColor = 'currentColor',
  label,
  showPercentage = true,
  animated = true,
  className = '',
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const offset = circumference - (percentage / 100) * circumference;

  const ringColor = useMemo(() => {
    if (typeof color === 'string') return color;
    // If it's a gradient or function
    return color;
  }, [color]);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
          opacity={0.15}
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={animated ? { strokeDashoffset: circumference } : false}
          animate={animated ? { strokeDashoffset: offset } : false}
          transition={animated ? { duration: 1, ease: 'easeOut' } : false}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercentage && (
          <span className="text-lg font-bold text-foreground">
            {Math.round(percentage)}%
          </span>
        )}
        {label && (
          <span className="text-xs text-muted-foreground">{label}</span>
        )}
      </div>
    </div>
  );
}

/**
 * Circular stat with icon
 */
export function StatRing({
  icon: Icon,
  value,
  label,
  color = '#3b82f6',
  size = 100,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={springTransition}
      className="flex flex-col items-center"
    >
      <ProgressRing
        value={value}
        size={size}
        strokeWidth={10}
        color={color}
        showPercentage={false}
      />
      <div
        className="absolute"
        style={{ width: size, height: size }}
      >
        <div className="flex items-center justify-center h-full">
          <Icon className="w-8 h-8" style={{ color }} />
        </div>
      </div>
      {label && (
        <p className="mt-2 text-sm text-muted-foreground font-medium text-center">
          {label}
        </p>
      )}
    </motion.div>
  );
}
