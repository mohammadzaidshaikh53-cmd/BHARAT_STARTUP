// components/ui/EmptyState.js — Standardized empty states
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { springConfig } from '@/lib/physics/engine';

export function EmptyState({ icon = '📭', title, description, action, actionLabel, actionHref }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springConfig}
      className="text-center py-12 sm:py-16 px-4"
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-5xl sm:text-6xl mb-4 inline-block"
      >
        {icon}
      </motion.div>
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">{description}</p>
      {action && (
        <Link
          href={actionHref || '#'}
          className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-all text-sm sm:text-base"
        >
          {actionLabel || 'Take Action'}
        </Link>
      )}
    </motion.div>
  );
}

// Specialized empty states
export function NoProductsEmpty({ href = '/add-product' }) {
  return (
    <EmptyState
      icon="📦"
      title="No products yet"
      description="Start listing your products to reach buyers across India."
      action
      actionLabel="Add Your First Product"
      actionHref={href}
    />
  );
}

export function NoSuppliersEmpty({ href = '/suppliers' }) {
  return (
    <EmptyState
      icon="🏭"
      title="No suppliers found"
      description="Try adjusting your filters or browse all suppliers."
      action
      actionLabel="Browse All Suppliers"
      actionHref={href}
    />
  );
}

export function NoRFQsEmpty({ href = '/rfq/create' }) {
  return (
    <EmptyState
      icon="📋"
      title="No buyer requests yet"
      description="Be the first to post a requirement and connect with suppliers."
      action
      actionLabel="Post a Requirement"
      actionHref={href}
    />
  );
}

export function NoSearchResults({ query, onClear }) {
  return (
    <EmptyState
      icon="🔍"
      title={`No results for "${query}"`}
      description="Try adjusting your search or filters to find what you're looking for."
      action={onClear}
      actionLabel="Clear Search"
    />
  );
}
