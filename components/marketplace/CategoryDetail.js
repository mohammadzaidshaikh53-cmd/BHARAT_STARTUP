// components/marketplace/CategoryDetail.js — Deep-dive category page

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
    ArrowLeft,
    Filter,
    MapPin,
    Award,
    TrendingUp,
    Package,
    Users,
    ChevronRight,
    SlidersHorizontal
} from 'lucide-react';
import { getCategoryBySlug } from '@/lib/marketplace/categories';
import ProductGrid from './ProductGrid';

export default function CategoryDetail({ slug }) {
    const router = useRouter();
    const category = getCategoryBySlug(slug);
    const [activeSubcategory, setActiveSubcategory] = useState('all');
    const [showFilters, setShowFilters] = useState(false);

    if (!category) return <div>Category not found</div>;

    const filteredProducts = activeSubcategory === 'all'
        ? [] // fetch all for category
        : []; // fetch for subcategory

    return (
        <div className="min-h-screen bg-bg-base">
            {/* Hero Banner */}
            <div className={`relative h-64 md:h-80 overflow-hidden`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-20`} />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/80 to-transparent" />

                <div className="relative max-w-7xl mx-auto px-4 h-full flex flex-col justify-end pb-8">
                    <button
                        onClick={() => router.back()}
                        className="absolute top-6 left-4 flex items-center gap-2 text-text-secondary hover:text-text-primary transition"
                    >
                        <ArrowLeft className="w-5 h-5" /> Back
                    </button>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${category.color} text-white text-sm font-medium`}>
                                {category.title}
                            </span>
                            <span className="text-text-tertiary text-sm">{category.count.toLocaleString()} suppliers</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-3">
                            {category.title}
                        </h1>
                        <p className="text-text-secondary text-lg max-w-2xl">{category.description}</p>
                    </motion.div>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="sticky top-0 z-20 bg-bg-base/90 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
                        <div className="flex items-center gap-2 text-sm">
                            <TrendingUp className="w-4 h-4 text-green-400" />
                            <span className="text-text-secondary">Growth:</span>
                            <span className="text-green-400 font-medium">{category.growth}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Package className="w-4 h-4 text-accent-primary" />
                            <span className="text-text-secondary">MOQ:</span>
                            <span className="text-text-primary font-medium">{category.moq}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Users className="w-4 h-4 text-accent-primary" />
                            <span className="text-text-secondary">Avg Order:</span>
                            <span className="text-text-primary font-medium">{category.avgOrderValue}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-accent-primary" />
                            <span className="text-text-secondary">Hubs:</span>
                            <span className="text-text-primary font-medium">{category.topCities?.join(', ')}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subcategory Filter */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    <button
                        onClick={() => setActiveSubcategory('all')}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${activeSubcategory === 'all'
                                ? 'bg-accent-primary text-bg-base'
                                : 'bg-bg-elevated text-text-secondary hover:text-text-primary border border-white/5'
                            }`}
                    >
                        All {category.title}
                    </button>
                    {category.subcategories?.map(sub => (
                        <button
                            key={sub.slug}
                            onClick={() => setActiveSubcategory(sub.slug)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${activeSubcategory === sub.slug
                                    ? 'bg-accent-primary text-bg-base'
                                    : 'bg-bg-elevated text-text-secondary hover:text-text-primary border border-white/5'
                                }`}
                        >
                            {sub.title}
                            <span className="ml-1.5 text-xs opacity-70">({sub.count})</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Certifications */}
            <div className="max-w-7xl mx-auto px-4 pb-6">
                <div className="flex items-center gap-2 text-sm text-text-tertiary">
                    <Award className="w-4 h-4" />
                    <span>Key certifications:</span>
                    {category.certifications?.map(cert => (
                        <span key={cert} className="px-2 py-0.5 rounded bg-white/5 text-text-secondary text-xs border border-white/5">
                            {cert}
                        </span>
                    ))}
                </div>
            </div>

            {/* Product Grid */}
            <div className="max-w-7xl mx-auto px-4 pb-16">
                <ProductGrid
                    feedType="category"
                    category={activeSubcategory === 'all' ? category.slug : activeSubcategory}
                />
            </div>
        </div>
    );
}