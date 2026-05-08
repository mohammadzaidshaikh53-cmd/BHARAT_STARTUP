'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import { MessageSquare, Users, TrendingUp, Clock, Plus, Search, Filter, ChevronRight } from 'lucide-react';
import { ScrollReveal, PhysicsCard, StaggerReveal, StaggerItem } from '@/components/motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/forms';
import { Avatar } from '@/components/common/Avatar';

const springTransition = {
  type: 'spring',
  stiffness: 350,
  damping: 28,
};

const MOCK_FORUMS = [
  {
    id: 'electronics',
    name: 'Electronics & Components',
    slug: 'electronics',
    description: 'Discuss ICs, microcontrollers, sensors, and all things electronics',
    icon: '🔌',
    color: 'from-blue-500 to-cyan-500',
    members: 12453,
    posts: 8921,
    recentActivity: '2 hours ago',
    featured: true,
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing & Industrial',
    slug: 'manufacturing',
    description: 'Production processes, machinery, and operational excellence',
    icon: '🏭',
    color: 'from-purple-500 to-pink-500',
    members: 8721,
    posts: 5432,
    recentActivity: '5 hours ago',
    featured: true,
  },
  {
    id: 'textiles',
    name: 'Textiles & Apparel',
    slug: 'textiles',
    description: 'Fabrics, garments, dyes, and textile machinery',
    icon: '🧵',
    color: 'from-amber-500 to-orange-500',
    members: 6234,
    posts: 3211,
    recentActivity: '1 day ago',
    featured: false,
  },
  {
    id: 'renewable',
    name: 'Renewable Energy',
    slug: 'renewable',
    description: 'Solar, wind, battery tech, and sustainable solutions',
    icon: '⚡',
    color: 'from-emerald-500 to-teal-500',
    members: 4532,
    posts: 2187,
    recentActivity: '3 hours ago',
    featured: false,
  },
  {
    id: 'agri',
    name: 'Agriculture & AgriTech',
    slug: 'agriculture',
    description: 'Farming techniques, machinery, and technology',
    icon: '🌾',
    color: 'from-green-500 to-emerald-500',
    members: 7891,
    posts: 4102,
    recentActivity: '6 hours ago',
    featured: false,
  },
  {
    id: 'logistics',
    name: 'Logistics & Supply Chain',
    slug: 'logistics',
    description: 'Shipping, warehousing, and supply chain optimization',
    icon: '🚚',
    color: 'from-gray-600 to-gray-700',
    members: 5123,
    posts: 2987,
    recentActivity: '12 hours ago',
    featured: false,
  },
];

export default function ForumsPage() {
  const [search, setSearch] = useState('');

  const filteredForums = MOCK_FORUMS.filter(forum =>
    forum.name.toLowerCase().includes(search.toLowerCase()) ||
    forum.description.toLowerCase().includes(search.toLowerCase())
  );

  const featuredForums = filteredForums.filter(f => f.featured);
  const otherForums = filteredForums.filter(f => !f.featured);

  return (
    <div className="container-app py-8">
      {/* Header */}
      <ScrollReveal>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Community <span className="gradient-text">Forums</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Join industry discussions and connect with peers
            </p>
          </div>
          <Link href="/community/forums/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Forum
            </Button>
          </Link>
        </div>
      </ScrollReveal>

      {/* Search */}
      <ScrollReveal delay={0.1}>
        <div className="mt-8 relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search forums..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </ScrollReveal>

      {/* Featured Forums */}
      {featuredForums.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Featured Forums
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredForums.map((forum, index) => (
              <ScrollReveal key={forum.id} delay={index * 0.1}>
                <Link href={`/community/forums/${forum.slug}`}>
                  <PhysicsCard className="card-premium p-6 group">
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${forum.color} flex items-center justify-center text-2xl shrink-0`}>
                        {forum.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">{forum.name}</h3>
                          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 rounded-full text-xs font-medium">
                            Featured
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {forum.description}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {forum.members.toLocaleString()} members
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {forum.posts.toLocaleString()} posts
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {forum.recentActivity}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                  </PhysicsCard>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      )}

      {/* All Forums */}
      {otherForums.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-muted-foreground" />
            All Forums
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherForums.map((forum, index) => (
              <ScrollReveal key={forum.id} delay={index * 0.05}>
                <Link href={`/community/forums/${forum.slug}`}>
                  <PhysicsCard className="card-premium p-5 h-full group">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${forum.color} flex items-center justify-center text-xl shrink-0`}>
                        {forum.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                          {forum.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Users className="w-3 h-3" />
                          {forum.members.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                      {forum.description}
                    </p>
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{forum.posts.toLocaleString()} posts</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                  </PhysicsCard>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredForums.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-16 text-center"
        >
          <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground/30" />
          <h3 className="mt-4 text-lg font-semibold">No forums found</h3>
          <p className="text-muted-foreground mt-2">
            Try adjusting your search terms
          </p>
        </motion.div>
      )}
    </div>
  );
}
