'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getNotifications, markAsRead, subscribeToNotifications } from '@/services/notificationService';

export default function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    // Load initial notifications
    const load = async () => {
      const data = await getNotifications(userId);
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    };
    load();

    // Subscribe to real-time updates
    const subscription = subscribeToNotifications(userId, (newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [userId]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    await Promise.all(unread.map(n => markAsRead(n.id)));
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const typeIcons = { inquiry: '💬', verified: '✅', rfq: '📋', message: '✉️', event: '🎪' };

  if (!userId) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Notifications">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse-glow" style={{width:'18px',height:'18px'}}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-fade-in">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs text-blue-600 hover:text-blue-700 font-medium">Mark all read</button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">No notifications yet</div>
            ) : notifications.map(n => (
              <Link key={n.id} href={n.link || '#'} onClick={() => setIsOpen(false)} className={`block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-50 dark:border-gray-700/50 last:border-0 ${!n.is_read ? 'bg-blue-50/50 dark:bg-blue-500/5' : ''}`}>
                <div className="flex gap-3">
                  <span className="text-lg">{typeIcons[n.type] || '📌'}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!n.is_read ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>{n.message || n.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{n.created_at ? new Date(n.created_at).toLocaleDateString() : ''}</p>
                  </div>
                  {!n.is_read && <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-2" />}
                </div>
              </Link>
            ))}
          </div>
          <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700">
            <Link href="/dashboard" onClick={() => setIsOpen(false)} className="text-xs text-blue-600 hover:text-blue-700 font-medium">View all notifications →</Link>
          </div>
        </div>
      )}
    </div>
  );
}
