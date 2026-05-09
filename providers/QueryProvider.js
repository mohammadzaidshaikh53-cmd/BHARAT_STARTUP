// app/providers/QueryProvider.js
'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

/**
 * Enterprise Query Provider
 * Pattern from: Vercel, Linear, Shopify
 *
 * Features:
 * - Optimized stale times per data type
 * - Exponential backoff retry
 * - Placeholder data persistence
 * - Devtools in development
 */
export function QueryProvider({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache data for 5 minutes, garbage collect after 30 minutes
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 30,

            // Don't refetch on window focus for critical data
            refetchOnWindowFocus: false,

            // Retry configuration - exponential backoff
            retry: (failureCount, error) => {
              // Don't retry client errors (4xx)
              if (error?.status >= 400 && error?.status < 500) {
                return false;
              }
              // Retry up to 3 times for server errors
              return failureCount < 3;
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

            // Keep previous data while fetching new (Linear pattern)
            placeholderData: (previousData) => previousData,
          },
          mutations: {
            retry: 1,
            retryDelay: 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom-left" />
      )}
    </QueryClientProvider>
  );
}