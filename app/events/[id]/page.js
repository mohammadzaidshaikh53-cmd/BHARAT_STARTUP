'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getEventById } from '@/services/eventService';

export default function EventDetailPage() {
  const params = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!params?.id) return;
    async function load() {
      const data = await getEventById(params.id);
      setEvent(data);
      setLoading(false);
    }
    load();
  }, [params?.id]);

  if (loading) return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="animate-pulse text-center">
        <div className="w-16 h-16 bg-purple-200 dark:bg-purple-800 rounded-xl mx-auto mb-4" />
        <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
      </div>
    </main>
  );

  if (!event) return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Event Not Found</h1>
        <Link href="/events" className="text-purple-600 underline font-medium">Browse Events</Link>
      </div>
    </main>
  );

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const tabs = [
    { key: 'overview', label: '📋 Overview' },
    { key: 'schedule', label: '📅 Schedule' },
    { key: 'exhibitors', label: '🏢 Exhibitors' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 pb-20">
      {/* Hero */}
      <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-violet-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link href="/events" className="text-purple-300 text-sm hover:text-white transition mb-6 inline-block">← All Events</Link>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">{event.industry}</span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">{event.status}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-4">{event.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-purple-200">
            <span>📅 {formatDate(event.date_start)} — {formatDate(event.date_end)}</span>
            <span>📍 {event.location}</span>
            <span>👥 {event.attendee_count?.toLocaleString()} expected attendees</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${activeTab === tab.key ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-purple-300'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">About This Event</h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{event.description}</p>
              </div>
              {event.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {event.tags.map(tag => <span key={tag} className="px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 text-xs font-medium border border-purple-100 dark:border-purple-500/20">#{tag}</span>)}
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Event Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Organizer</span><span className="font-medium text-gray-900 dark:text-gray-100 text-right">{event.organizer}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Location</span><span className="font-medium text-gray-900 dark:text-gray-100 text-right">{event.city}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Exhibitors</span><span className="font-medium text-gray-900 dark:text-gray-100">{event.exhibitor_count}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Expected Attendees</span><span className="font-medium text-gray-900 dark:text-gray-100">{event.attendee_count?.toLocaleString()}</span></div>
                </div>
              </div>
              <Link href="/rfq/create" className="block w-full text-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-purple-500/20">📝 Post Sourcing Requirement</Link>
              <Link href="/suppliers" className="block w-full text-center px-6 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">🏭 Find Suppliers</Link>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-4">
            {event.sessions?.length > 0 ? event.sessions.map((session, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 flex items-start gap-4">
                <div className="w-16 h-16 bg-purple-50 dark:bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-sm shrink-0">{session.time}</div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-gray-100">{session.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">🎤 {session.speaker}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-12 text-gray-500">Schedule will be announced soon</div>
            )}
          </div>
        )}

        {activeTab === 'exhibitors' && (
          <div className="space-y-4">
            {event.booths?.length > 0 ? event.booths.map((booth, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">{booth.company[0]}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">{booth.company}</h4>
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 px-2 py-0.5 rounded-full">Booth {booth.booth}</span>
                  </div>
                  <p className="text-sm text-gray-500">{booth.industry}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {booth.products?.map(p => <span key={p} className="text-xs bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded-full">{p}</span>)}
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-12 text-gray-500">Exhibitor list will be announced soon</div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
