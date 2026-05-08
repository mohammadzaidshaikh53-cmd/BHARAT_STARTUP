/**
 * Enterprise Data Visualization
 * Pattern from: Stripe, Vercel Analytics, Bloomberg
 *
 * Features:
 * - Chart primitives
 * - Data visualization hooks
 * - Animated transitions
 * - Responsive sizing
 */

'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Interpolation } from '@/lib/physics/engine';

const springTransition = {
  type: 'spring',
  stiffness: 350,
  damping: 28,
};

/**
 * Simple Line Chart
 */
export function LineChart({
  data = [],
  width = 400,
  height = 200,
  color = 'currentColor',
  strokeWidth = 2,
  showArea = true,
  animated = true,
  className = '',
}) {
  const { path, area, points } = useMemo(() => {
    if (data.length < 2) {
      return { path: '', area: '', points: [] };
    }

    const min = Math.min(...data.map((d) => d.value));
    const max = Math.max(...data.map((d) => d.value));
    const range = max - min || 1;

    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const pts = data.map((d, i) => ({
      x: padding + (i / (data.length - 1)) * chartWidth,
      y: padding + chartHeight - ((d.value - min) / range) * chartHeight,
      value: d.value,
      label: d.label,
    }));

    // Create smooth path
    let pathStr = `M ${pts[0].x} ${pts[0].y}`;

    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cpx = (prev.x + curr.x) / 2;
      pathStr += ` Q ${cpx} ${prev.y}, ${curr.x} ${curr.y}`;
    }

    // Area path
    const areaStr = `${pathStr} L ${pts[pts.length - 1].x} ${height - padding} L ${pts[0].x} ${height - padding} Z`;

    return { path: pathStr, area: areaStr, points: pts };
  }, [data, width, height]);

  if (data.length < 2) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <span className="text-sm text-muted-foreground">Not enough data</span>
      </div>
    );
  }

  return (
    <svg width={width} height={height} className={className}>
      <defs>
        <linearGradient id="line-chart-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {showArea && (
        <motion.path
          d={area}
          fill="url(#line-chart-gradient)"
          initial={animated ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}

      <motion.path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={animated ? { pathLength: 0 } : false}
        animate={animated ? { pathLength: 1 } : false}
        transition={animated ? { duration: 1, ease: 'easeOut' } : false}
      />

      {/* Data points */}
      {points.map((point, i) => (
        <motion.circle
          key={i}
          cx={point.x}
          cy={point.y}
          r={4}
          fill="white"
          stroke={color}
          strokeWidth={2}
          initial={animated ? { scale: 0 } : false}
          animate={animated ? { scale: 1 } : false}
          transition={{ ...springTransition, delay: animated ? i * 0.05 : 0 }}
        />
      ))}
    </svg>
  );
}

/**
 * Bar Chart
 */
export function BarChart({
  data = [],
  width = 400,
  height = 200,
  color = 'currentColor',
  animated = true,
  className = '',
}) {
  const { bars, maxValue } = useMemo(() => {
    const maxVal = Math.max(...data.map((d) => d.value));
    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const barWidth = chartWidth / data.length - 8;

    const b = data.map((d, i) => ({
      x: padding + i * (chartWidth / data.length) + 4,
      height: (d.value / maxVal) * chartHeight,
      y: padding + chartHeight - (d.value / maxVal) * chartHeight,
      width: barWidth,
      value: d.value,
      label: d.label,
    }));

    return { bars: b, maxValue: maxVal };
  }, [data, width, height]);

  return (
    <svg width={width} height={height} className={className}>
      {bars.map((bar, i) => (
        <motion.g key={i}>
          <motion.rect
            x={bar.x}
            y={animated ? height : bar.y + bar.height}
            width={bar.width}
            height={animated ? 0 : bar.height}
            rx={4}
            fill={color}
            initial={animated ? { height: 0, y: height - padding } : false}
            animate={animated ? { height: bar.height, y: bar.y } : { height: bar.height, y: bar.y }}
            transition={{ ...springTransition, delay: i * 0.05 }}
          />
          <text
            x={bar.x + bar.width / 2}
            y={height - 5}
            textAnchor="middle"
            fontSize={10}
            fill="currentColor"
            className="text-muted-foreground"
          >
            {bar.label}
          </text>
        </motion.g>
      ))}
    </svg>
  );
}

/**
 * Donut Chart
 */
export function DonutChart({
  data = [],
  size = 200,
  strokeWidth = 24,
  animated = true,
  className = '',
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const center = size / 2;

  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);

  let currentAngle = -90; // Start from top

  const segments = useMemo(() => {
    return data.map((item) => {
      const percentage = item.value / total;
      const angle = percentage * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle = endAngle;

      // Calculate arc path
      const startRadians = (startAngle * Math.PI) / 180;
      const endRadians = (endAngle * Math.PI) / 180;

      const x1 = center + radius * Math.cos(startRadians);
      const y1 = center + radius * Math.sin(startRadians);
      const x2 = center + radius * Math.cos(endRadians);
      const y2 = center + radius * Math.sin(endRadians);

      const largeArc = angle > 180 ? 1 : 0;

      const path = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;

      return {
        ...item,
        path,
        percentage,
        startAngle,
      };
    });
  }, [data, total, center, radius]);

  const totalOffset = circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          opacity={0.1}
        />

        {/* Segments */}
        {segments.map((segment, i) => {
          const dashArray = segment.percentage * circumference;
          const dashOffset = circumference - segment.percentage * circumference;

          return (
            <motion.circle
              key={i}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dashArray} ${circumference}`}
              strokeDashoffset={animated ? circumference : dashOffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${center} ${center})`}
              initial={animated ? { strokeDashoffset: circumference } : false}
              animate={animated ? { strokeDashoffset: dashOffset } : false}
              transition={{ ...springTransition, delay: i * 0.1 }}
            />
          );
        })}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">{total.toLocaleString()}</span>
        <span className="text-sm text-muted-foreground">Total</span>
      </div>

      {/* Legend */}
      <div className="absolute -right-4 top-1/2 -translate-y-1/2 space-y-2">
        {segments.slice(0, 4).map((segment, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-muted-foreground">{segment.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Sparkline with gradient fill
 */
export function MiniSparkline({
  data = [],
  width = 80,
  height = 32,
  color = '#3b82f6',
  className = '',
}) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((value - min) / range) * (height - 4) - 2,
  }));

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`;
  }

  const area = `${path} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <svg width={width} height={height} className={className}>
      <defs>
        <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spark-${color})`} />
      <path d={path} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}

/**
 * Gauge Chart (for metrics)
 */
export function GaugeChart({
  value = 0,
  max = 100,
  size = 120,
  label,
  color = '#3b82f6',
  className = '',
}) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - 16) / 2;
  const circumference = radius * Math.PI; // Half circle
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size / 2 + 20}>
        {/* Background arc */}
        <path
          d={`M 8 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 8} ${size / 2}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={12}
          opacity={0.1}
          strokeLinecap="round"
        />

        {/* Value arc */}
        <motion.path
          d={`M 8 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 8} ${size / 2}`}
          fill="none"
          stroke={color}
          strokeWidth={12}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />

        {/* Value text */}
        <text
          x={size / 2}
          y={size / 2 + 10}
          textAnchor="middle"
          className="text-2xl font-bold fill-foreground"
        >
          {Math.round(percentage)}%
        </text>

        {/* Label */}
        {label && (
          <text
            x={size / 2}
            y={size / 2 + 30}
            textAnchor="middle"
            className="text-xs fill-muted-foreground"
          >
            {label}
          </text>
        )}
      </svg>
    </div>
  );
}
