'use client';

import { motion } from 'framer-motion';
import { Store, Plus, Search, Filter, MapPin, Star } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { PhysicsCard, ScrollReveal } from '@/components/motion';
import { StatCard, StatCardGrid } from '@/components/data-display';
import { Input } from '@/components/forms';
import { Button } from '@/components/ui/Button';

const springTransition = {
  type: 'spring',
  stiffness: 350,
  damping: 28,
};

// Mock data - would come from API
const MOCK_STORES = [
  {
    id: '1',
    name: 'TechMart India',
    slug: 'techmart-india',
    description: 'Premium electronics and components supplier',
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200',
    owner: { name: 'Rajesh Kumar', verified: true },
    rating: 4.8,
    products: 245,
    location: 'Mumbai, Maharashtra',
  },
  {
    id: '2',
    name: 'GreenLeaf Organics',
    slug: 'greenleaf-organics',
    description: 'Sustainable agricultural products and exports',
    logo: 'https://images.unsplash.com/photo-1542838132-92c533dd91ee?w=200',
    owner: { name: 'Priya Sharma', verified: true },
    rating: 4.9,
    products: 128,
    location: 'Pune, Maharashtra',
  },
  {
    id: '3',
    name: 'SteelWorks Pro',
    slug: 'steelworks-pro',
    description: 'Industrial steel and metal fabrication',
    logo: 'https://images.unsplash.com/photo-1504327695602-1e9b3e8b1a1b?w=200',
    owner: { name: 'Amit Patel', verified: false },
    rating: 4.5,
    products: 89,
    location: 'Surat, Gujarat',
  },
];

export default function StoresPage() {
  const [search, setSearch] = useState('');

  return (
    <div className="container-app py-8">
      {/* Hero Section */}
      <ScrollReveal>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-background to-accent/5 p-8 md:p-12">
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={springTransition}
            >
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Vendor <span className="gradient-text">Storefronts</span>
              </h1>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
                Explore verified stores and create your own branded storefront.
                Every store is backed by our trust guarantee.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springTransition, delay: 0.1 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Link href="/stores/create">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Your Store
                </Button>
              </Link>
              <Button variant="outline" className="gap-2">
                <Store className="w-4 h-4" />
                Browse Categories
              </Button>
            </motion.div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />
        </div>
      </ScrollReveal>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springTransition, delay: 0.2 }}
        className="mt-8"
      >
        <StatCardGrid columns={4}>
          <StatCard label="Total Stores" value="2,847" delay={0.1} />
          <StatCard label="Verified Sellers" value="1,456" trend="up" trendValue="12%" delay={0.15} />
          <StatCard label="Active Products" value="45.2K" delay={0.2} />
          <StatCard label="Avg. Rating" value="4.6" suffix="/5" trend="up" trendValue="0.2" delay={0.25} />
        </StatCardGrid>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springTransition, delay: 0.3 }}
        className="mt-8 flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search stores by name, product, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </motion.div>

      {/* Store Grid */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_STORES.map((store, index) => (
          <ScrollReveal key={store.id} delay={index * 0.1}>
            <Link href={`/stores/${store.slug}`}>
              <PhysicsCard className="card-premium p-6 h-full">
                <div className="flex items-start gap-4">
                  <img
                    src={store.logo}
                    alt={store.name}
                    className="w-16 h-16 rounded-2xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg truncate">{store.name}</h3>
                      {store.owner.verified && (
                        <span className="shrink-0 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{store.description}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-medium">{store.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Store className="w-4 h-4" />
                    <span>{store.products} products</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{store.location}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-sm font-medium text-primary">
                    Visit Store →
                  </span>
                </div>
              </PhysicsCard>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
