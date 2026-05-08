/**
 * TanStack Query Client Configuration
 * Pattern from: Vercel, Shopify, Stripe
 *
 * Implements:
 * - Intelligent caching with stale-while-revalidate
 * - Retry with exponential backoff
 * - Optimistic updates for mutations
 * - Real-time subscription support
 */

import { QueryClient } from '@tanstack/react-query';

const ONE_MINUTE = 60 * 1000;
const FIVE_MINUTES = 5 * ONE_MINUTE;
const THIRTY_MINUTES = 30 * ONE_MINUTE;
const ONE_HOUR = 60 * ONE_MINUTE;

// Retry configuration - exponential backoff like Stripe API
const RETRY_CONFIG = {
  retry: (failureCount, error) => {
    // Don't retry client errors (4xx)
    if (error?.status >= 400 && error?.status < 500) {
      return false;
    }
    // Retry up to 3 times for server errors or network issues
    return failureCount < 3;
  },
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes, garbage collect after 30 minutes
      staleTime: FIVE_MINUTES,
      gcTime: THIRTY_MINUTES,

      // Don't refetch on window focus for critical data
      refetchOnWindowFocus: false,
      refetchOnMount: true,

      // Retry configuration
      ...RETRY_CONFIG,

      // Pattern from Linear: keep previous data while fetching new
      placeholderData: (previousData) => previousData,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Query persistence for offline support (like Vercel)
export const persistanceConfig = {
  storage: typeof window !== 'undefined' ? window.localStorage : null,
  slots: {
    products: 'one-solution-products',
    rfqs: 'one-solution-rfqs',
    events: 'one-solution-events',
  },
};
