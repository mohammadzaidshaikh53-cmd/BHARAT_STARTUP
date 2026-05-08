// components/marketplace/MarketplaceCategories.js
'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import {
    MARKETPLACE_CATEGORIES,
    B2B_CATEGORIES,
} from '@/constants/marketplaceCategories';

const ALL_CATEGORIES_SORTED = [
    ...MARKETPLACE_CATEGORIES,
    ...B2B_CATEGORIES,
].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return b.count - a.count;
});

export default function MarketplaceCategories() {
    const [showAll, setShowAll] = useState(false);

    const visibleCategories = useMemo(() => {
        return showAll
            ? ALL_CATEGORIES_SORTED
            : ALL_CATEGORIES_SORTED.filter((c) => c.featured);
    }, [showAll]);

    return (
        <section className="relative py-16 bg-gray-50 dark:bg-gray-950 overflow-hidden">

            {/* Background Decoration */}
            <div className="absolute inset-0 pointer-events-none opacity-30">
                <div className="absolute top-0 left-0 w-72 h-72 bg-orange-200 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-72 h-72 bg-pink-200 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-14">

                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 text-sm font-medium mb-4">
                        🚀 Bharat Startup Marketplace
                    </span>

                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Browse by Industry
                    </h2>

                    <p className="mt-5 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                        Discover verified Indian suppliers, manufacturers, wholesalers,
                        startups, and B2B businesses across every major industry vertical.
                    </p>

                </div>

                {/* Category Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">

                    {visibleCategories.map((category) => (
                        <Link
                            key={category.slug}
                            href={`/marketplace/category/${category.slug}`}
                            className="group relative rounded-3xl overflow-hidden bg-white dark:bg-gray-900 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-800"
                        >

                            {/* Gradient Background */}
                            <div
                                className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-90`}
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300" />

                            {/* Featured Badge */}
                            {category.featured && (
                                <div className="absolute top-3 right-3 z-20">
                                    <span className="px-2 py-1 rounded-full bg-yellow-400 text-black text-[10px] font-bold shadow">
                                        Featured
                                    </span>
                                </div>
                            )}

                            {/* Content */}
                            <div className="relative z-10 p-5 flex flex-col h-full">

                                {/* Image */}
                                <div className="flex items-center justify-center h-28 mb-4">

                                    <div className="relative w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center overflow-hidden">

                                        <Image
                                            src={category.image}
                                            alt={category.title}
                                            width={80}
                                            height={80}
                                            className="object-contain group-hover:scale-110 transition-transform duration-300"
                                            priority={category.featured}
                                        />

                                    </div>

                                </div>

                                {/* Title */}
                                <h3 className="text-sm sm:text-base font-bold text-white text-center leading-tight min-h-[40px] flex items-center justify-center">
                                    {category.title}
                                </h3>

                                {/* Description */}
                                <p className="mt-2 text-xs text-white/90 text-center line-clamp-2 min-h-[36px]">
                                    {category.description}
                                </p>

                                {/* Supplier Count */}
                                <div className="mt-4 flex justify-center">

                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-[11px] font-medium border border-white/10">
                                        🏭 {category.count.toLocaleString()} suppliers
                                    </span>

                                </div>

                            </div>

                        </Link>
                    ))}

                </div>

                {/* Toggle */}
                <div className="mt-12 flex justify-center">

                    <button
                        onClick={() => setShowAll((prev) => !prev)}
                        className="inline-flex items-center gap-3 px-8 py-3 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all font-medium text-gray-700 dark:text-gray-200"
                    >

                        <span>
                            {showAll
                                ? 'Show Featured Only'
                                : `Show All ${ALL_CATEGORIES_SORTED.length} Categories`}
                        </span>

                        <svg
                            className={`w-4 h-4 transition-transform duration-300 ${showAll ? 'rotate-180' : ''
                                }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>

                    </button>

                </div>

            </div>
        </section>
    );
}