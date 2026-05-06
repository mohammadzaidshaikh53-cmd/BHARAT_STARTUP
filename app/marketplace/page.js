// app/marketplace/page.js
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MarketplaceLandingPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/marketplace/category/all');
  }, [router]);

  // Show a brief loading state while redirecting
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 bg-orange-100 rounded-xl mx-auto mb-4 animate-pulse" />
        <p className="text-gray-500">Loading marketplace...</p>
      </div>
    </div>
  );
}