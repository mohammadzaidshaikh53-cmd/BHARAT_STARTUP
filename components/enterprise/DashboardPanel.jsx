/**
 * Enterprise Dashboard Panel System
 * Pattern from: Stripe Dashboard, Linear, Vercel Analytics
 *
 * Features:
 * - Resizable panels
 * - Collapsible sections
 * - Stackable layouts
 * - Responsive grid
 * - Drag-and-drop (future)
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useCallback } from 'react';
import { ChevronDown, Maximize2, Minimize2, MoreHorizontal, X } from 'lucide-react';
import { PhysicsCard } from '@/components/motion';

const springTransition = {
  type: 'spring',
  stiffness: 350,
  damping: 28,
};

/**
 * Dashboard Panel - collapsible, expandable container
 */
export function DashboardPanel({
  title,
  subtitle,
  icon: Icon,
  children,
  defaultOpen = true,
  actions,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <motion.div
      layout
      className={`
        card-premium overflow-hidden
        ${isFullscreen ? 'fixed inset-4 z-50' : ''}
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 text-muted-foreground" />}
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {actions}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Maximize2 className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <motion.div animate={{ rotate: isOpen ? 0 : -90 }}>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </motion.div>
          </button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={springTransition}
            className="overflow-hidden"
          >
            <div className="p-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * Dashboard Grid - responsive grid layout
 */
export function DashboardGrid({ children, columns = 12, gap = 6, className = '' }) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 lg:grid-cols-2',
    3: 'grid-cols-1 lg:grid-cols-3',
    4: 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-4',
    6: 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-6',
    12: 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-12',
  };

  return (
    <div className={`grid ${gridCols[columns] || gridCols[12]} gap-${gap} ${className}`}>
      {children}
    </div>
  );
}

/**
 * Dashboard Column - span helper
 */
export function DashboardColumn({
  children,
  span = 4,
  className = '',
}) {
  const spanClasses = {
    1: 'col-span-1',
    2: 'col-span-1 lg:col-span-2',
    3: 'col-span-1 lg:col-span-3',
    4: 'col-span-1 lg:col-span-4',
    6: 'col-span-1 lg:col-span-6',
    8: 'col-span-1 lg:col-span-8',
    12: 'col-span-1 lg:col-span-12',
  };

  return <div className={`${spanClasses[span] || spanClasses[4]} ${className}`}>{children}</div>;
}

/**
 * Dashboard Stack - vertical stacking with dividers
 */
export function DashboardStack({ children, className = '' }) {
  return (
    <div className={`flex flex-col ${className}`}>
      {children.map((child, index) => (
        <div key={index}>
          {child}
          {index < children.length - 1 && (
            <div className="h-px bg-gray-100 dark:bg-gray-800 my-6" />
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Stat Panel - inline stat display
 */
export function StatPanel({
  label,
  value,
  change,
  changeType = 'neutral', // 'up' | 'down' | 'neutral'
  icon: Icon,
  className = '',
}) {
  const changeColors = {
    up: 'text-emerald-500',
    down: 'text-red-500',
    neutral: 'text-muted-foreground',
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      )}
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{value}</span>
          {change !== undefined && (
            <span className={`text-sm font-medium ${changeColors[changeType]}`}>
              {changeType === 'up' && '+'}
              {change}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Dashboard Header
 */
export function DashboardHeader({
  title,
  subtitle,
  actions,
  className = '',
}) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 ${className}`}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

/**
 * KPI Card - key metric display
 */
export function KPICard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  sparklineData,
  className = '',
}) {
  return (
    <PhysicsCard className={`card-premium p-6 ${className}`}>
      <p className="text-sm text-muted-foreground font-medium">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
      {subtitle && (
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      )}
      {trendValue !== undefined && (
        <div className={`flex items-center gap-1 mt-2 ${trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground'}`}>
          <span className="text-sm font-medium">{trend === 'up' ? '+' : ''}{trendValue}</span>
          <span className="text-xs">vs last period</span>
        </div>
      )}
    </PhysicsCard>
  );
}
