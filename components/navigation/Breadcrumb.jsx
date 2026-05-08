'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

const springTransition = {
  type: 'spring',
  stiffness: 350,
  damping: 28,
};

export function Breadcrumb({ items = [], className = '' }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center gap-1 text-sm">
        <li>
          <Link
            href="/"
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="w-4 h-4" />
          </Link>
        </li>

        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            {item.href ? (
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Animated breadcrumb with hover effects
 */
export function AnimatedBreadcrumb({ items = [], className = '' }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center gap-0.5 text-sm">
        <motion.li
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={springTransition}
        >
          <Link
            href="/"
            className="group flex items-center px-2 py-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Home className="w-4 h-4" />
          </Link>
        </motion.li>

        {items.map((item, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...springTransition, delay: index * 0.05 }}
            className="flex items-center"
          >
            <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600" />
            {item.href ? (
              <Link
                href={item.href}
                className="px-2 py-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="px-2 py-1 text-foreground font-medium bg-primary/10 rounded-lg">
                {item.label}
              </span>
            )}
          </motion.li>
        ))}
      </ol>
    </nav>
  );
}
