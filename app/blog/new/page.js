'use client';

import dynamic from 'next/dynamic';

const BlogEditor = dynamic(
  () => import('./editor').then(mod => mod.BlogEditor),
  {
    ssr: false, // 🔥 THIS IS THE KEY
  }
);

export default function NewBlogPostPage() {
  return (
    <div className="min-h-screen bg-white">
      <BlogEditor />
    </div>
  );
}