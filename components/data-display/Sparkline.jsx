'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

const springTransition = {
  type: 'spring',
  stiffness: 350,
  damping: 28,
};

export function Sparkline({
  data = [],
  width = 120,
  height = 40,
  color = 'currentColor',
  strokeWidth = 2,
  showArea = true,
  animated = true,
  className = '',
}) {
  const pathData = useMemo(() => {
    if (data.length < 2) return { line: '', area: '' };

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 4) - 2;
      return { x, y };
    });

    // Generate smooth curve using quadratic bezier
    let line = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = (prev.x + curr.x) / 2;
      line += ` Q ${cpx} ${prev.y}, ${curr.x} ${curr.y}`;
    }

    // Area path
    const area = `${line} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    return { line, area };
  }, [data, width, height]);

  if (data.length < 2) {
    return (
      <svg width={width} height={height} className={className}>
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray="4 4"
          opacity={0.3}
        />
      </svg>
    );
  }

  const MotionPath = animated ? motion.path : 'path';

  return (
    <svg width={width} height={height} className={className} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={`sparkline-gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {showArea && (
        <MotionPath
          d={pathData.area}
          fill={`url(#sparkline-gradient-${color})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}

      <MotionPath
        d={pathData.line}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={animated ? { pathLength: 0 } : false}
        animate={animated ? { pathLength: 1 } : false}
        transition={animated ? { duration: 1, ease: 'easeOut' } : false}
      />
    </svg>
  );
}

/**
 * Trend indicator with sparkline
 */
export function TrendSparkline({
  data = [],
  trend,
  height = 32,
}) {
  const colors = {
    up: '#10b981',
    down: '#ef4444',
    neutral: '#6b7280',
  };

  return (
    <Sparkline
      data={data}
      width={80}
      height={height}
      color={colors[trend] || colors.neutral}
      strokeWidth={1.5}
      showArea={false}
    />
  );
}
