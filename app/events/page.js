'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchEvents, getEventIndustries, getEventCities } from '@/services/eventService';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [industry, setIndustry] = useState('');
  const [city, setCity] = useState('');

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

  const industries = getEventIndustries();
  const cities = getEventCities();

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
    return `In ${days} days`;
  };

  const gradients = [
    'from-violet-600 via-purple-600 to-indigo-700',
    'from-blue-600 via-cyan-600 to-teal-600',
    'from-orange-500 via-red-500 to-pink-600',
    'from-emerald-600 via-green-600 to-teal-700',
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 pb-20">
      {/* Hero */}
      <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-violet-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">🎪 Events & Expos</span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-semibold border border-white/20">{events.length} Upcoming</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-3">Trade Shows & Business Events</h1>
          <p className="text-purple-200 text-lg max-w-2xl">Discover upcoming expos, trade fairs, and networking events across India. Connect with suppliers, buyers, and industry leaders.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input type="text" placeholder="🔍 Search events..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 px-5 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900 dark:text-gray-100 shadow-sm" />
          <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm">
            <option value="">All Industries</option>
            {industries.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
          <select value={city} onChange={(e) => setCity(e.target.value)} className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm">
            <option value="">All Cities</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="rounded-2xl overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-700" />
                <div className="p-6 space-y-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎪</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No events found</h3>
            <p className="text-gray-500">Try different filters or check back later for upcoming events.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event, idx) => (
              <Link key={event.id} href={`/events/${event.id}`} className="group rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700/50 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-gray-800/80">
                {/* Gradient banner */}
                <div className={`h-44 bg-gradient-to-br ${gradients[idx % gradients.length]} relative p-6 flex flex-col justify-end`}>
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold">{getDaysUntil(event.date_start)}</div>
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/20 backdrop-blur-sm text-white text-xs font-semibold">{event.industry}</div>
                  <h3 className="text-xl font-black text-white leading-tight group-hover:translate-x-1 transition-transform">{event.title}</h3>
                </div>
                <div className="p-5">
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{event.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">📅 {formatDate(event.date_start, event.date_end)}</span>
                    <span className="flex items-center gap-1">📍 {event.city}</span>
                    <span className="flex items-center gap-1">👥 {event.attendee_count?.toLocaleString()} attendees</span>
                    <span className="flex items-center gap-1">🏢 {event.exhibitor_count} exhibitors</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
