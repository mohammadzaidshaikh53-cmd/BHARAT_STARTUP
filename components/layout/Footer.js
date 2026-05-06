// components/layout/Footer.js
'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="py-12 border-t border-gray-200 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          <span className="font-bold tracking-tight">Bharat Startup</span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Connecting Indian startups with real buyers.
        </p>
        <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-500">
          <Link href="/marketplace">Marketplace</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/help">Support</Link>
        </div>
      </div>
    </footer>
  );
}