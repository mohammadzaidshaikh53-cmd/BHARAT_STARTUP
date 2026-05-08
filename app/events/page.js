'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { fetchEvents, getEventIndustries, getEventCities } from '@/services/eventService';
import {
  Calendar,
  MapPin,
  Users,
  Building2,
  Ticket,
  ChevronRight,
  Search,
  Filter,
  Grid3x3,
  Map,
  Clock,
  Sparkles,
  ExternalLink,
  TrendingUp,
} from 'lucide-react';

const springConfig = { type: 'spring', stiffness: 350, damping: 28 };

// Expo category sections
const EXPO_CATEGORIES = [
  { key: 'trade_show', label: 'Trade Shows', icon: '🏪', count: 24 },
  { key: 'expo', label: 'Expos', icon: '🎪', count: 18 },
  { key: 'conference', label: 'Conferences', icon: '🎤', count: 12 },
  { key: 'networking', label: 'Networking', icon: '🤝', count: 8 },
  { key: 'virtual', label: 'Virtual Events', icon: '💻', count: 15 },
  { key: 'hybrid', label: 'Hybrid Events', icon: '🌐', count: 6 },
];

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [industry, setIndustry] = useState('');
  const [city, setCity] = useState('');
  const [industries, setIndustries] = useState([]);
  const [cities, setCities] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    async function loadFilters() {
      const [ind, cit] = await Promise.all([getEventIndustries(), getEventCities()]);
      setIndustries(ind);
      setCities(cit);
    }
    loadFilters();
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const result = await fetchEvents({ industry: industry || null, city: city || null, searchTerm: searchTerm || null });
      setEvents(result.events);
      setLoading(false);
    }
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [searchTerm, industry, city]);

  const formatDate = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const opts = { month: 'short', day: 'numeric' };
    if (s.getMonth() === e.getMonth()) return `${s.toLocaleDateString('en-IN', opts)} – ${e.getDate()}, ${s.getFullYear()}`;
    return `${s.toLocaleDateString('en-IN', opts)} – ${e.toLocaleDateString('en-IN', opts)}, ${s.getFullYear()}`;
  };

  const getDaysUntil = (dateStr) => {
    const days = Math.ceil((new Date(dateStr) - Date.now()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Past event';
    if (days === 0) return 'Today!';
    if (days === 1) return 'Tomorrow';
    return `${days} days left`;
  };

  const gradients = [
    'from-violet-600 via-purple-600 to-indigo-700',
    'from-blue-600 via-cyan-600 to-teal-600',
    'from-orange-500 via-red-500 to-pink-600',
    'from-emerald-600 via-green-600 to-teal-700',
    'from-amber-500 via-orange-500 to-red-600',
    'from-indigo-600 via-blue-600 to-cyan-700',
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 pb-20">
      {/* Hero */}
      <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-violet-900 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            className="absolute -right-32 -top-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
            className="absolute -left-32 -bottom-32 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springConfig}
            className="flex items-center gap-2 mb-3"
          >
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Events & Expos
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-semibold border border-white/20">
              {events.length} Upcoming
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springConfig, delay: 0.1 }}
            className="text-3xl md:text-4xl font-black mb-3"
          >
            Trade Shows & Business Events
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springConfig, delay: 0.2 }}
            className="text-purple-200 text-lg max-w-2xl mb-6"
          >
            Discover upcoming expos, trade fairs, and networking events across India. Connect with suppliers, buyers, and industry leaders.
          </motion.p>

          {/* Quick Category Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springConfig, delay: 0.3 }}
            className="flex flex-wrap gap-2"
          >
            {EXPO_CATEGORIES.map((cat, i) => (
              <motion.button
                key={cat.key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...springConfig, delay: 0.3 + i * 0.05 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(cat.key)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                  border transition-all duration-200
                  ${activeCategory === cat.key
                    ? 'bg-white text-purple-900 border-white shadow-lg'
                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                  }
                `}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className={`
                  text-xs px-2 py-0.5 rounded-full
                  ${activeCategory === cat.key ? 'bg-purple-500/20 text-purple-700' : 'bg-white/10'}
                `}>
                  {cat.count}
                </span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters & View Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springConfig, delay: 0.4 }}
          className="flex flex-col md:flex-row gap-4 mb-8"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search events, industries, cities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900 dark:text-gray-100 shadow-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm"
            >
              <option value="">All Industries</option>
              {industries.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm"
            >
              <option value="">All Cities</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {/* View Toggle */}
            <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 transition-colors ${viewMode === 'grid' ? 'bg-purple-500 text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 transition-colors ${viewMode === 'list' ? 'bg-purple-500 text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Event Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springConfig, delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Total Events', value: '45+', icon: Calendar, color: 'from-purple-500 to-pink-500' },
            { label: 'This Month', value: '12', icon: TrendingUp, color: 'from-blue-500 to-cyan-500' },
            { label: 'Exhibitors', value: '2.5K', icon: Building2, color: 'from-emerald-500 to-teal-500' },
            { label: 'Attendees', value: '50K+', icon: Users, color: 'from-amber-500 to-orange-500' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springConfig, delay: 0.5 + i * 0.1 }}
              whileHover={{ y: -4, transition: springConfig }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springConfig, delay: i * 0.1 }}
                className="rounded-2xl overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-gray-200 dark:bg-gray-700" />
                <div className="p-6 space-y-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springConfig}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🎪</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No events found</h3>
            <p className="text-gray-500">Try different filters or check back later for upcoming events.</p>
          </motion.div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event, idx) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springConfig, delay: idx * 0.05 }}
                whileHover={{ y: -8, transition: springConfig }}
              >
                <Link
                  href={`/events/${event.id}`}
                  className="group block rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700/50 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 bg-white dark:bg-gray-800/80"
                >
                  {/* Gradient banner */}
                  <div className={`h-44 bg-gradient-to-br ${gradients[idx % gradients.length]} relative p-6 flex flex-col justify-end`}>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold flex items-center gap-1"
                    >
                      <Clock className="w-3 h-3" />
                      {getDaysUntil(event.date_start)}
                    </motion.div>
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/20 backdrop-blur-sm text-white text-xs font-semibold flex items-center gap-1">
                      {event.industry}
                    </div>
                    <h3 className="text-xl font-black text-white leading-tight group-hover:translate-x-1 transition-transform">
                      {event.title}
                    </h3>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{event.description}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(event.date_start, event.date_end)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.city}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {event.attendee_count?.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {event.exhibitor_count}
                      </span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                      <span className="text-sm font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                        View Details
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-xs font-medium flex items-center gap-1">
                        <Ticket className="w-3 h-3" />
                        Tickets Available
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          // List View
          <div className="space-y-4">
            {events.map((event, idx) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...springConfig, delay: idx * 0.05 }}
                whileHover={{ x: 4, transition: springConfig }}
              >
                <Link
                  href={`/events/${event.id}`}
                  className="flex items-center gap-6 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 hover:border-purple-500/30 hover:shadow-lg transition-all duration-300"
                >
                  <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${gradients[idx % gradients.length]} flex items-center justify-center text-white font-bold shrink-0`}>
                    <div className="text-center">
                      <p className="text-lg">{new Date(event.date_start).getDate()}</p>
                      <p className="text-xs opacity-80">{new Date(event.date_start).toLocaleDateString('en-IN', { month: 'short' })}</p>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{event.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{event.city}</span>
                      <span className="flex items-center gap-1"><Users className="w-4 h-4" />{event.attendee_count} attendees</span>
                      <span className="flex items-center gap-1"><Building2 className="w-4 h-4" />{event.exhibitor_count} exhibitors</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDaysUntil(event.date_start) === 'Past event' ? 'bg-gray-100 text-gray-500' : 'bg-purple-500/10 text-purple-600'}`}>
                      {getDaysUntil(event.date_start)}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
