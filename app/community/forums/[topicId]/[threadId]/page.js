'use client';

import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { MessageSquare, Users, TrendingUp, Clock, Pin, MoreHorizontal, Heart, Share2, Flag } from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal, PhysicsCard, StaggerReveal, StaggerItem, staggerItemVariants } from '@/components/motion';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/common/Avatar';

const springTransition = {
  type: 'spring',
  stiffness: 350,
  damping: 28,
};

const MOCK_FORUM = {
  id: 'electronics',
  name: 'Electronics & Components',
  slug: 'electronics',
  description: 'Discuss ICs, microcontrollers, sensors, and all things electronics',
  icon: '🔌',
  color: 'from-blue-500 to-cyan-500',
  members: 12453,
  posts: 8921,
  recentActivity: '2 hours ago',
  admin: { name: 'Vikram Singh', avatar: null },
};

const MOCK_THREADS = [
  {
    id: '1',
    title: 'Best suppliers for ESP32 modules in 2024?',
    excerpt: 'Looking for reliable suppliers for ESP32-WROOM-32 modules. Quality and consistency are more important than price. Any recommendations from the community?',
    author: { name: 'Rahul Mehta', avatar: null },
    replies: 23,
    views: 1245,
    votes: 45,
    createdAt: '3 hours ago',
    pinned: true,
    tags: ['esp32', 'suppliers', 'iot'],
  },
  {
    id: '2',
    title: 'STM32 vs PIC for industrial automation',
    excerpt: 'Starting a new industrial automation project. Need to choose between STM32 and PIC microcontrollers. Performance requirements are moderate but reliability is critical.',
    author: { name: 'Ananya Sharma', avatar: null },
    replies: 67,
    views: 3421,
    votes: 89,
    createdAt: '8 hours ago',
    pinned: false,
    tags: ['stm32', 'pic', 'industrial'],
  },
  {
    id: '3',
    title: 'How to implement secure boot on ESP32?',
    excerpt: 'I need to implement secure boot on my ESP32-based product to protect against firmware theft. Has anyone done this successfully?',
    author: { name: 'Karthik Nair', avatar: null },
    replies: 15,
    views: 892,
    votes: 28,
    createdAt: '1 day ago',
    pinned: false,
    tags: ['esp32', 'security', 'firmware'],
  },
  {
    id: '4',
    title: 'Sourcing-quality resistors and capacitors in bulk',
    excerpt: 'Looking for trusted distributors for SMD resistors and capacitors in bulk quantities. Need 0805 and 0603 packages primarily.',
    author: { name: 'Priya Patel', avatar: null },
    replies: 31,
    views: 1567,
    votes: 52,
    createdAt: '2 days ago',
    pinned: false,
    tags: ['passives', 'sourcing', 'bulk'],
  },
];

export default function ForumDetailPage() {
  const params = useParams();
  const forumId = params.topicId;

  return (
    <div className="container-app py-8">
      {/* Forum Header */}
      <ScrollReveal>
        <div className="flex items-start gap-4 mb-8">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${MOCK_FORUM.color} flex items-center justify-center text-3xl shrink-0`}>
            {MOCK_FORUM.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{MOCK_FORUM.name}</h1>
            </div>
            <p className="text-muted-foreground mt-1">{MOCK_FORUM.description}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {MOCK_FORUM.members.toLocaleString()} members
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                {MOCK_FORUM.posts.toLocaleString()} posts
              </span>
            </div>
          </div>
          <Button>Join Forum</Button>
        </div>
      </ScrollReveal>

      {/* Actions Bar */}
      <ScrollReveal delay={0.1}>
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex gap-2">
            <Button variant="default" size="sm">Latest</Button>
            <Button variant="ghost" size="sm">Top</Button>
            <Button variant="ghost" size="sm">Unanswered</Button>
          </div>
          <div className="flex-1" />
          <Button className="gap-2">
            <MessageSquare className="w-4 h-4" />
            New Thread
          </Button>
        </div>
      </ScrollReveal>

      {/* Threads List */}
      <StaggerReveal className="space-y-3">
        {MOCK_THREADS.map((thread) => (
          <StaggerItem key={thread.id}>
            <Link href={`/community/forums/${forumId}/${thread.id}`}>
              <PhysicsCard className="card-premium p-5 group">
                {thread.pinned && (
                  <div className="flex items-center gap-1 text-xs text-primary font-medium mb-3">
                    <Pin className="w-3 h-3" />
                    Pinned
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <Avatar
                    src={thread.author.avatar}
                    alt={thread.author.name}
                    className="w-10 h-10"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {thread.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {thread.excerpt}
                    </p>

                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      {thread.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs text-muted-foreground"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-1 text-sm">
                      <Heart className="w-4 h-4 text-muted-foreground" />
                      <span>{thread.votes}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MessageSquare className="w-4 h-4" />
                      <span>{thread.replies}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">by</span>
                    <span className="font-medium">{thread.author.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {thread.views} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {thread.createdAt}
                    </span>
                  </div>
                </div>
              </PhysicsCard>
            </Link>
          </StaggerItem>
        ))}
      </StaggerReveal>
    </div>
  );
}
