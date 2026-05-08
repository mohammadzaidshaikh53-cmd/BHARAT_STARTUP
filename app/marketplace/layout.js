// app/marketplace/layout.js
// FIXED: Removed duplicate QueryClientProvider (root layout already provides one)
// Kept SavedProvider which is marketplace-specific
'use client';

import { Suspense } from 'react';
import { SavedProvider } from '@/context/SavedContext';

export default function MarketplaceLayout({ children }) {
  return (
    <SavedProvider>
      <Suspense
        fallback={
          <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="w-12 h-12 bg-orange-200 dark:bg-orange-800 rounded-xl" />
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        }
      >
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
          {children}
        </div>
      </Suspense>
    </SavedProvider>
  );
}