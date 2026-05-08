'use client';

/**
 * Query Provider Wrapper
 * Pattern from: Vercel, Linear, Shopify
 *
 * Provides:
 * - TanStack Query context
 * - Error boundaries
 * - Devtools in development
 */

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Suspense } from 'react';
import { queryClient } from './queryClient';

function QueryErrorBoundary({ children }) {
  return children;
}

export function QueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <QueryErrorBoundary>
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </QueryErrorBoundary>
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom-left" />
      )}
    </QueryClientProvider>
  );
}

// Hook to access client from outside React tree (for SSR)
export function getQueryClient() {
  return queryClient;
}
