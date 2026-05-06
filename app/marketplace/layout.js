// app/marketplace/layout.js
'use client';

import { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

export default function MarketplaceLayout({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense
        fallback={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="w-12 h-12 bg-orange-200 rounded-xl" />
              <div className="h-4 w-32 bg-gray-200 rounded" />
            </div>
          </div>
        }
      >
        {/* Inherits your root Navbar automatically */}
        <div className="min-h-screen bg-gray-50 text-gray-900">
          {children}
        </div>
      </Suspense>
    </QueryClientProvider>
  );
}