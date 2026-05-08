'use client';
import Link from 'next/link';

export default function Error({ error, reset }) {
    return (
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
                <p className="text-gray-500 mb-4">{error.message || 'Failed to load product'}</p>
                <div className="flex gap-4 justify-center">
                    <button onClick={reset} className="px-4 py-2 bg-orange-600 text-white rounded-full">Try Again</button>
                    <Link href="/marketplace/trending" className="px-4 py-2 border rounded-full">Back to Marketplace</Link>
                </div>
            </div>
        </main>
    );
}