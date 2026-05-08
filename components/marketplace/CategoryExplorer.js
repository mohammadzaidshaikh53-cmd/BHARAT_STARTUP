// components/marketplace/CategoryExplorer.js — Immersive category browser

'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    TrendingUp,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Building2,
    MapPin,
    Award,
    Package
} from 'lucide-react';
import { MARKETPLACE_CATEGORIES, getFeaturedCategories } from '@/lib/marketplace/categories';

const ICON_MAP = {
    Shirt: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" /></svg>,
    Cpu: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>,
    Cog: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Apple: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    HeartPulse: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
    Car: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
};

export default function CategoryExplorer() {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [hoveredCard, setHoveredCard] = useState(null);
    const scrollRef = useRef(null);

    const featured = getFeaturedCategories();
    const allCategories = MARKETPLACE_CATEGORIES;

    const scroll = (direction) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: direction * 400, behavior: 'smooth' });
        }
    };

    return (
        <div className="w-full">
            {/* ─── HERO SECTION: Featured Categories ─── */}
            <section className="relative py-16 overflow-hidden">
                {/* Background ambient */}
                <div className="absolute inset-0 bg-gradient-to-b from-bg-base via-bg-raised/30 to-bg-base" />
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-primary/5 rounded-full blur-[128px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[128px]" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-primary/10 text-accent-primary text-sm font-medium mb-4">
                                <TrendingUp className="w-4 h-4" />
                                {allCategories.length} B2B Verticals
                            </span>
                            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
                                Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-cyan-400">Industry Verticals</span>
                            </h2>
                            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                                Connect with verified manufacturers, wholesalers, and suppliers across India's largest B2B marketplace
                            </p>
                        </motion.div>
                    </div>

                    {/* Featured Grid - Masonry-style */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                        {featured.map((category, index) => (
                            <motion.div
                                key={category.slug}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className={`group relative rounded-2xl overflow-hidden cursor-pointer ${index === 0 ? 'md:col-span-2 lg:col-span-1' : ''
                                    }`}
                                onMouseEnter={() => setHoveredCard(category.slug)}
                                onMouseLeave={() => setHoveredCard(null)}
                                onClick={() => router.push(`/marketplace/category/${category.slug}`)}
                            >
                                {/* Background gradient */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />
                                <div className="absolute inset-0 bg-bg-elevated/80 backdrop-blur-sm" />

                                {/* Content */}
                                <div className="relative p-6 h-full flex flex-col">
                                    {/* Top row */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 rounded-xl bg-gradient-to-br ${category.color} text-white shadow-lg`}>
                                            {ICON_MAP[category.icon]?.() || <Package className="w-6 h-6" />}
                                        </div>
                                        <div className="text-right">
                                            <span className="text-2xl font-bold text-text-primary">{category.count.toLocaleString()}</span>
                                            <p className="text-xs text-text-tertiary">Suppliers</p>
                                        </div>
                                    </div>

                                    {/* Title & desc */}
                                    <h3 className="text-xl font-bold text-text-primary mb-2 group-hover:text-accent-primary transition-colors">
                                        {category.title}
                                    </h3>
                                    <p className="text-sm text-text-secondary mb-4 flex-grow">{category.description}</p>

                                    {/* Stats row */}
                                    <div className="flex items-center gap-4 text-xs text-text-tertiary mb-4">
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {category.topCities?.[0]}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Award className="w-3 h-3" />
                                            {category.certifications?.length} certs
                                        </span>
                                        <span className="text-green-400 font-medium">{category.growth}</span>
                                    </div>

                                    {/* Subcategories preview */}
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        {category.subcategories?.slice(0, 4).map(sub => (
                                            <span key={sub.slug} className="px-2 py-0.5 rounded-md bg-white/5 text-text-tertiary text-[11px] border border-white/5">
                                                {sub.title}
                                            </span>
                                        ))}
                                        {category.subcategories?.length > 4 && (
                                            <span className="px-2 py-0.5 rounded-md bg-accent-primary/10 text-accent-primary text-[11px]">
                                                +{category.subcategories.length - 4}
                                            </span>
                                        )}
                                    </div>

                                    {/* CTA */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-text-tertiary">MOQ: {category.moq}</span>
                                        <motion.div
                                            animate={{ x: hoveredCard === category.slug ? 4 : 0 }}
                                            className="flex items-center gap-1 text-sm text-accent-primary font-medium"
                                        >
                                            Explore <ArrowRight className="w-4 h-4" />
                                        </motion.div>
                                    </div>
                                </div>

                                {/* Hover glow */}
                                <motion.div
                                    className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none`}
                                />
                            </motion.div>
                        ))}
                    </div>

                    {/* ─── ALL CATEGORIES HORIZONTAL SCROLL ─── */}
                    <div className="mt-16">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-text-primary">All Industries</h3>
                            <div className="flex gap-2">
                                <button onClick={() => scroll(-1)} className="p-2 rounded-full bg-bg-elevated border border-white/10 hover:border-accent-primary/30 transition">
                                    <ChevronLeft className="w-5 h-5 text-text-secondary" />
                                </button>
                                <button onClick={() => scroll(1)} className="p-2 rounded-full bg-bg-elevated border border-white/10 hover:border-accent-primary/30 transition">
                                    <ChevronRight className="w-5 h-5 text-text-secondary" />
                                </button>
                            </div>
                        </div>

                        <div
                            ref={scrollRef}
                            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {allCategories.map((category, index) => (
                                <motion.div
                                    key={category.slug}
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex-shrink-0 w-72 snap-start"
                                >
                                    <div
                                        className="group relative rounded-xl overflow-hidden bg-bg-elevated border border-white/5 hover:border-accent-primary/20 cursor-pointer transition-all duration-300"
                                        onClick={() => router.push(`/marketplace/category/${category.slug}`)}
                                    >
                                        {/* Mini hero image */}
                                        <div className="relative h-32 overflow-hidden">
                                            <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-20`} />
                                            <div className="absolute inset-0 bg-gradient-to-t from-bg-elevated to-transparent" />
                                            <div className="absolute bottom-3 left-4 right-4">
                                                <h4 className="text-lg font-bold text-text-primary">{category.title}</h4>
                                                <p className="text-xs text-text-tertiary">{category.count.toLocaleString()} suppliers</p>
                                            </div>
                                        </div>

                                        {/* Quick stats */}
                                        <div className="p-4">
                                            <div className="flex items-center justify-between text-xs text-text-tertiary mb-3">
                                                <span className="flex items-center gap-1">
                                                    <TrendingUp className="w-3 h-3 text-green-400" />
                                                    {category.growth}
                                                </span>
                                                <span>Avg: {category.avgOrderValue}</span>
                                            </div>

                                            {/* Subcategory pills */}
                                            <div className="flex flex-wrap gap-1">
                                                {category.subcategories?.slice(0, 3).map(sub => (
                                                    <span key={sub.slug} className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-text-tertiary">
                                                        {sub.title}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* ─── BOTTOM CTA ─── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-16 text-center"
                    >
                        <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-accent-primary/10 via-cyan-500/10 to-accent-primary/10 border border-accent-primary/20">
                            <Building2 className="w-8 h-8 text-accent-primary" />
                            <div className="text-left">
                                <p className="text-text-primary font-semibold">Can't find your industry?</p>
                                <p className="text-text-secondary text-sm">We support 200+ B2B verticals. Browse all or request addition.</p>
                            </div>
                            <button
                                onClick={() => router.push('/marketplace/all-categories')}
                                className="px-6 py-2.5 bg-accent-primary text-bg-base rounded-xl font-medium hover:bg-accent-primary/90 transition whitespace-nowrap"
                            >
                                View All Categories
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}