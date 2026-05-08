'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import {
  HomeIcon,
  ShoppingBagIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronDownIcon,
  SunIcon,
  MoonIcon,
  SparklesIcon,
  Bars3Icon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  FireIcon,
  TagIcon,
  HeartIcon,
  BookmarkIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ClockIcon,
  TrashIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  BuildingOffice2Icon,
  TicketIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  RectangleStackIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

// -----------------------------------------------------------------------------
// CONFIG & REALISTIC MOCK DATA
// -----------------------------------------------------------------------------
const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: HomeIcon },
  {
    href: '/organizations',
    label: 'Organizations',
    icon: BuildingOffice2Icon,
    highlight: true,
    children: [
      { href: '/organizations', label: 'Explore Organizations', icon: GlobeAltIcon },
      { href: '/organizations/verified', label: 'Verified Firms', icon: ShieldCheckIcon },
      { href: '/organizations/industries', label: 'Industries', icon: RectangleStackIcon },
      { href: '/organizations/create', label: 'Create Organization', icon: PlusIcon },
    ],
  },
  {
    href: '/marketplace',
    label: 'Marketplace',
    icon: ShoppingBagIcon,
    children: [
      { href: '/marketplace/trending', label: 'Trending', icon: FireIcon },
      { href: '/marketplace/new', label: 'New Arrivals', icon: SparklesIcon },
      { href: '/marketplace/deals', label: 'Deals', icon: TagIcon },
      { href: '/marketplace/saved', label: 'Saved', icon: BookmarkIcon },
    ],
  },
  { href: '/exhibitions', label: 'Exhibitions', icon: TicketIcon },
  { href: '/network', label: 'Network', icon: UserGroupIcon },
  { href: '/chat', label: 'Chat', icon: ChatBubbleLeftRightIcon },   // ✅ ADDED CHAT BUTTON
  { href: '/insights', label: 'Insights', icon: ChartBarIcon },
];

// Secondary items moved out of primary nav
const SECONDARY_ITEMS = [
  { href: '/ideas', label: 'Ideas', icon: LightBulbIcon },
  { href: '/chat', label: 'Chat', icon: ChatBubbleLeftRightIcon },
  { href: '/blog', label: 'Blog', icon: DocumentTextIcon },
];

const RECENT_SEARCHES = [
  { id: 'r1', query: 'verified enterprise partners', type: 'org', timestamp: Date.now() - 3600000 },
  { id: 'r2', query: 'How to list a product', type: 'help', timestamp: Date.now() - 86400000 },
  { id: 'r3', query: 'quantum computing exhibitions', type: 'exhibition', timestamp: Date.now() - 172800000 },
];

const QUICK_ACTIONS = [
  { label: 'Create Organization', icon: BuildingOffice2Icon, shortcut: '⌘O', href: '/organizations/create', color: 'text-blue-500' },
  { label: 'New Product', icon: ShoppingBagIcon, shortcut: '⌘N', href: '/marketplace/new', color: 'text-orange-500' },
  { label: 'Create Exhibition', icon: TicketIcon, shortcut: '⌘E', href: '/exhibitions/new', color: 'text-purple-500' },
  { label: 'Share Idea', icon: LightBulbIcon, shortcut: '⌘I', href: '/ideas/new', color: 'text-amber-500' },
  { label: 'Settings', icon: Cog6ToothIcon, shortcut: '⌘,', href: '/settings' },
];

const CREATE_OPTIONS = [
  { label: 'Create Organization', icon: BuildingOffice2Icon, href: '/organizations/create', desc: 'Establish a new trust entity' },
  { label: 'New Product', icon: ShoppingBagIcon, href: '/marketplace/new', desc: 'List a product or service' },
  { label: 'Create Exhibition', icon: TicketIcon, href: '/exhibitions/new', desc: 'Host a showcase or space' },
  { label: 'Share Idea', icon: LightBulbIcon, href: '/ideas/new', desc: 'Publish to the network' },
];

// -----------------------------------------------------------------------------
// UTILITIES: Realistic relative time
// -----------------------------------------------------------------------------
const getRelativeTime = (timestamp) => {
  if (!timestamp) return '';
  const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return diffHours === 1 ? '1h ago' : `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// -----------------------------------------------------------------------------
// COMPONENT: Avatar with realistic fallback
// -----------------------------------------------------------------------------
function Avatar({ name, src, size = 32, className }) {
  const initials = name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
  const colors = [
    'bg-slate-100 text-slate-700',
    'bg-blue-100 text-blue-700',
    'bg-emerald-100 text-emerald-700',
    'bg-indigo-100 text-indigo-700',
  ];
  const colorIndex = name?.length % colors.length || 0;

  return (
    <div
      className={cn('relative rounded-full overflow-hidden flex-shrink-0', className)}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className={cn('w-full h-full flex items-center justify-center text-[11px] font-semibold tracking-tight', colors[colorIndex])}>
          {initials}
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// COMPONENT: Command Palette
// -----------------------------------------------------------------------------
function CommandPalette({ isOpen, onClose, onNavigate }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState(RECENT_SEARCHES);
  const inputRef = useRef(null);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const allPages = [
      { id: '1', title: 'Home', href: '/', icon: HomeIcon, section: 'Platform' },
      { id: '2', title: 'Organizations', href: '/organizations', icon: BuildingOffice2Icon, section: 'Platform' },
      { id: '3', title: 'Verified Organizations', href: '/organizations/verified', icon: ShieldCheckIcon, section: 'Organizations' },
      { id: '4', title: 'Industries', href: '/organizations/industries', icon: RectangleStackIcon, section: 'Organizations' },
      { id: '5', title: 'Marketplace', href: '/marketplace', icon: ShoppingBagIcon, section: 'Platform' },
      { id: '6', title: 'Exhibitions', href: '/exhibitions', icon: TicketIcon, section: 'Platform' },
      { id: '7', title: 'Network', href: '/network', icon: UserGroupIcon, section: 'Platform' },
      { id: '8', title: 'Insights', href: '/insights', icon: ChartBarIcon, section: 'Platform' },
      { id: '9', title: 'Create Organization', href: '/organizations/create', icon: PlusIcon, section: 'Actions' },
      { id: '10', title: 'Trending Products', href: '/marketplace/trending', icon: FireIcon, section: 'Marketplace' },
      { id: '11', title: 'Share Idea', href: '/ideas/new', icon: LightBulbIcon, section: 'Community' },
      { id: '12', title: 'Chat', href: '/chat', icon: ChatBubbleLeftRightIcon, section: 'Community' },
    ];
    return allPages.filter((p) => p.title.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      const items = query.trim() === '' ? recentSearches : results;
      const len = Math.max(items.length, 1);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % len);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + len) % len);
      } else if (e.key === 'Enter') {
        if (query.trim() === '' && recentSearches[selectedIndex]) {
          setQuery(recentSearches[selectedIndex].query);
        } else if (results[selectedIndex]) {
          onNavigate(results[selectedIndex].href);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose, onNavigate, query, recentSearches]);

  const clearRecent = (e, id) => {
    e.stopPropagation();
    setRecentSearches((prev) => prev.filter((r) => r.id !== id));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="w-full max-w-xl mx-4 bg-white dark:bg-[#0f0f10] rounded-2xl border border-black/5 dark:border-white/[0.06] shadow-2xl overflow-hidden ring-1 ring-black/5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-black/5 dark:border-white/[0.06]">
            <MagnifyingGlassIcon className="w-[18px] h-[18px] text-gray-400 dark:text-gray-500" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Search organizations, products, exhibitions..."
              className="flex-1 bg-transparent text-[15px] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 outline-none"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400"
              >
                <XMarkIcon className="w-3.5 h-3.5" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-100 dark:bg-white/5 dark:text-gray-500 rounded border border-gray-200 dark:border-white/10">
              ESC
            </kbd>
          </div>

          <div className="max-h-[380px] overflow-y-auto py-2">
            {query.trim() === '' ? (
              <>
                {recentSearches.length > 0 && (
                  <div className="px-2 mb-2">
                    <div className="flex items-center justify-between px-3 py-1.5">
                      <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                        Recent
                      </p>
                      <button
                        onClick={() => setRecentSearches([])}
                        className="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                    {recentSearches.map((item, i) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setQuery(item.query);
                        }}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors group',
                          i === selectedIndex
                            ? 'bg-gray-100 dark:bg-white/[0.06] text-gray-900 dark:text-gray-100'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.03]'
                        )}
                      >
                        <ClockIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <span className="flex-1 text-left">{item.query}</span>
                        <button
                          onClick={(e) => clearRecent(e, item.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                        >
                          <TrashIcon className="w-3 h-3 text-gray-400" />
                        </button>
                      </button>
                    ))}
                  </div>
                )}

                <div className="px-2">
                  <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 py-1.5">
                    Quick Actions
                  </p>
                  {QUICK_ACTIONS.map((action, i) => (
                    <button
                      key={action.label}
                      onClick={() => {
                        onNavigate(action.href);
                        onClose();
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                        (i + recentSearches.length) === selectedIndex
                          ? 'bg-gray-100 dark:bg-white/[0.06] text-gray-900 dark:text-gray-100'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.03]'
                      )}
                    >
                      <action.icon className={cn('w-4 h-4', action.color || 'text-gray-400 dark:text-gray-500')} />
                      <span className="flex-1 text-left">{action.label}</span>
                      <kbd className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">{action.shortcut}</kbd>
                    </button>
                  ))}
                </div>
              </>
            ) : results.length === 0 ? (
              <div className="p-8 text-center">
                <MagnifyingGlassIcon className="w-8 h-8 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No results for "<span className="text-gray-900 dark:text-gray-200 font-medium">{query}</span>"
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Try a different search term</p>
              </div>
            ) : (
              <div className="px-2">
                {results.map((result, i) => (
                  <button
                    key={result.id}
                    onClick={() => {
                      onNavigate(result.href);
                      onClose();
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                      i === selectedIndex
                        ? 'bg-gray-100 dark:bg-white/[0.06] text-gray-900 dark:text-gray-100'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.03]'
                    )}
                  >
                    <result.icon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <div className="flex-1 text-left">
                      <p className="font-medium">{result.title}</p>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500">{result.section}</p>
                    </div>
                    <ArrowTopRightOnSquareIcon className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 px-4 py-2.5 border-t border-black/5 dark:border-white/[0.06] text-[11px] text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-white/[0.02]">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-white dark:bg-white/5 rounded border border-gray-200 dark:border-white/10 text-[10px]">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-white dark:bg-white/5 rounded border border-gray-200 dark:border-white/10 text-[10px]">⏎</kbd>
              Select
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// -----------------------------------------------------------------------------
// COMPONENT: Notification Panel
// -----------------------------------------------------------------------------
function NotificationPanel({ isOpen, onClose, notifications, onMarkRead, onMarkAllRead }) {
  const panelRef = useRef(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'message': return ChatBubbleLeftRightIcon;
      case 'offer': return TagIcon;
      case 'success': return CheckCircleIcon;
      case 'alert': return ExclamationTriangleIcon;
      case 'system': return ArrowPathIcon;
      default: return InformationCircleIcon;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'message': return 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400';
      case 'offer': return 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400';
      case 'success': return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400';
      case 'alert': return 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400';
    }
  };

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: 6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.96 }}
      transition={{ type: 'spring', damping: 26, stiffness: 320 }}
      className="absolute right-0 top-full mt-2.5 w-[360px] bg-white dark:bg-[#0f0f10] rounded-2xl border border-black/5 dark:border-white/[0.06] shadow-2xl overflow-hidden z-50 ring-1 ring-black/5"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-black/5 dark:border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-gray-900 dark:bg-white text-white dark:text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors font-medium"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-[360px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-3">
              <BellIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No notifications</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">You're all caught up</p>
          </div>
        ) : (
          <div className="divide-y divide-black/[0.03] dark:divide-white/[0.04]">
            {notifications.map((notif) => {
              const Icon = getIcon(notif.type);
              const colorClass = getColor(notif.type);
              return (
                <button
                  key={notif.id}
                  onClick={() => onMarkRead(notif.id)}
                  className={cn(
                    'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02]',
                    !notif.read && 'bg-blue-50/30 dark:bg-blue-500/[0.02]'
                  )}
                >
                  <div className={cn('p-1.5 rounded-lg flex-shrink-0 mt-0.5', colorClass)}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'text-[13px] leading-snug',
                        !notif.read ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'
                      )}
                    >
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{notif.body}</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-600 mt-1.5 font-medium">{getRelativeTime(notif.created_at)}</p>
                  </div>
                  {!notif.read && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0 mt-2" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="px-4 py-2.5 border-t border-black/5 dark:border-white/[0.06] text-center bg-gray-50/50 dark:bg-white/[0.02]">
        <Link
          href="/notifications"
          className="text-xs font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          onClick={onClose}
        >
          View all notifications
        </Link>
      </div>
    </motion.div>
  );
}

// -----------------------------------------------------------------------------
// COMPONENT: Create Dropdown
// -----------------------------------------------------------------------------
function CreateDropdown({ isOpen, onClose, onNavigate }) {
  const panelRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: 6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.96 }}
      transition={{ type: 'spring', damping: 26, stiffness: 320 }}
      className="absolute right-0 top-full mt-2.5 w-72 bg-white dark:bg-[#0f0f10] rounded-2xl border border-black/5 dark:border-white/[0.06] shadow-2xl overflow-hidden z-50 ring-1 ring-black/5"
    >
      <div className="px-4 py-3 border-b border-black/5 dark:border-white/[0.06]">
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Create New</p>
      </div>
      <div className="p-1.5">
        {CREATE_OPTIONS.map((option) => (
          <button
            key={option.label}
            onClick={() => {
              onNavigate(option.href);
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.04] group"
          >
            <div className="p-1.5 rounded-md bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              <option.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{option.label}</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-500 leading-tight">{option.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// -----------------------------------------------------------------------------
// COMPONENT: User Dropdown
// -----------------------------------------------------------------------------
function UserDropdown({ isOpen, onClose, user, onLogout, onNavigate }) {
  const panelRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const email = user.email;

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: 6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.96 }}
      transition={{ type: 'spring', damping: 26, stiffness: 320 }}
      className="absolute right-0 top-full mt-2.5 w-60 bg-white dark:bg-[#0f0f10] rounded-2xl border border-black/5 dark:border-white/[0.06] shadow-2xl overflow-hidden z-50 ring-1 ring-black/5"
    >
      <div className="px-4 py-3 border-b border-black/5 dark:border-white/[0.06]">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{displayName}</p>
        <p className="text-xs text-gray-500 dark:text-gray-500 truncate mt-0.5">{email}</p>
      </div>

      <div className="p-1.5">
        <button
          onClick={() => { onNavigate('/profile'); onClose(); }}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
        >
          <UserIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <span className="flex-1 text-left">Profile</span>
          <kbd className="text-[10px] text-gray-400 dark:text-gray-600 font-mono">⌘P</kbd>
        </button>
        <button
          onClick={() => { onNavigate('/my-listings'); onClose(); }}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
        >
          <ShoppingBagIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <span className="flex-1 text-left">My Listings</span>
        </button>
        <button
          onClick={() => { onNavigate('/saved'); onClose(); }}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
        >
          <HeartIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <span className="flex-1 text-left">Saved Items</span>
        </button>
        <button
          onClick={() => { onNavigate('/analytics'); onClose(); }}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
        >
          <ChartBarIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <span className="flex-1 text-left">Analytics</span>
        </button>
      </div>

      <div className="border-t border-black/5 dark:border-white/[0.06] p-1.5">
        <button
          onClick={() => { onNavigate('/settings'); onClose(); }}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
        >
          <Cog6ToothIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <span className="flex-1 text-left">Settings</span>
          <kbd className="text-[10px] text-gray-400 dark:text-gray-600 font-mono">⌘,</kbd>
        </button>
        <button
          onClick={() => { onNavigate('/help'); onClose(); }}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
        >
          <QuestionMarkCircleIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <span className="flex-1 text-left">Help & Support</span>
        </button>
      </div>

      <div className="border-t border-black/5 dark:border-white/[0.06] p-1.5">
        <button
          onClick={() => { onLogout(); onClose(); }}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4" />
          <span className="flex-1 text-left">Sign Out</span>
        </button>
      </div>
    </motion.div>
  );
}

// -----------------------------------------------------------------------------
// COMPONENT: Mobile Menu
// -----------------------------------------------------------------------------
function MobileMenu({ isOpen, onClose, user, onLogout, onNavigate }) {
  const [expandedItem, setExpandedItem] = useState(null);

  const toggleExpand = (href) => {
    setExpandedItem(expandedItem === href ? null : href);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm md:hidden"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="absolute left-0 top-0 bottom-0 w-[300px] bg-white dark:bg-[#0a0a0a] border-r border-black/5 dark:border-white/[0.06] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-black/5 dark:border-white/[0.06]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center">
                <SparklesIcon className="w-4 h-4 text-white dark:text-black" />
              </div>
              <span className="text-base font-bold tracking-tight text-gray-900 dark:text-white">Bharat Startup</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {user && (
            <div className="px-4 py-4 border-b border-black/5 dark:border-white/[0.06]">
              <div className="flex items-center gap-3">
                <Avatar name={user.email || 'User'} src={user.user_metadata?.avatar_url} size={40} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          <div className="p-2 space-y-0.5">
            {NAV_ITEMS.map((item) => (
              <div key={item.href}>
                <button
                  onClick={() => {
                    if (item.children) {
                      toggleExpand(item.href);
                    } else {
                      onNavigate(item.href);
                      onClose();
                    }
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors font-medium"
                >
                  <item.icon className={cn('w-5 h-5', item.highlight ? 'text-indigo-500' : 'text-gray-500 dark:text-gray-500')} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.children && (
                    <ChevronDownIcon className={cn('w-4 h-4 text-gray-400 transition-transform duration-200', expandedItem === item.href && 'rotate-180')} />
                  )}
                </button>
                {item.children && (
                  <AnimatePresence>
                    {expandedItem === item.href && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="ml-4 pl-4 border-l border-gray-200 dark:border-white/10 space-y-0.5 mt-0.5 mb-1">
                          {item.children.map((child) => (
                            <button
                              key={child.href}
                              onClick={() => {
                                onNavigate(child.href);
                                onClose();
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                            >
                              <child.icon className="w-4 h-4" />
                              <span className="flex-1 text-left">{child.label}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </div>

          <div className="p-2 border-t border-black/5 dark:border-white/[0.06]">
            <p className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-widest">Community</p>
            {SECONDARY_ITEMS.map((item) => (
              <button
                key={item.href}
                onClick={() => {
                  onNavigate(item.href);
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1 text-left font-medium">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="p-2 border-t border-black/5 dark:border-white/[0.06]">
            {user ? (
              <button
                onClick={() => { onLogout(); onClose(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-medium"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={() => { onNavigate('/login'); onClose(); }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm bg-gray-900 dark:bg-white text-white dark:text-black font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              >
                <UserIcon className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// -----------------------------------------------------------------------------
// MAIN: Navbar
// -----------------------------------------------------------------------------
export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commandOpen, setCommandOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hidden, setHidden] = useState(false);

  const { scrollY } = useScroll();
  const lastScrollY = useRef(0);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const direction = latest > lastScrollY.current ? 'down' : 'up';
    const velocity = Math.abs(latest - lastScrollY.current);

    if (direction === 'down' && latest > 80 && velocity > 5) {
      setHidden(true);
    } else if (direction === 'up') {
      setHidden(false);
    }
    lastScrollY.current = latest;
  });

  useEffect(() => {
    const isDark =
      localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  }, []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (mounted) {
        setUser(user);
        setLoading(false);
      }
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setUser(session?.user ?? null);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setCommandOpen(false);
        setNotifOpen(false);
        setUserMenuOpen(false);
        setCreateMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // TODO: Replace with real notification fetching from Supabase
  useEffect(() => {
    if (!user) return;
    setNotifications([]);
  }, [user]);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    router.push('/login');
  }, [router]);

  const handleNavigate = useCallback(
    (href) => {
      router.push(href);
    },
    [router]
  );

  const markRead = useCallback((id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const isActive = useCallback(
    (href) => {
      if (href === '/') return pathname === '/';
      return pathname === href || pathname?.startsWith(href + '/');
    },
    [pathname]
  );

  const closeAllMenus = () => {
    setNotifOpen(false);
    setUserMenuOpen(false);
    setCreateMenuOpen(false);
  };

  if (loading) {
    return (
      <div className="sticky top-0 z-50 w-full h-14 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/[0.06]" />
    );
  }

  return (
    <>
      <motion.nav
        initial={false}
        animate={{ y: hidden ? -64 : 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className={cn(
          'sticky top-0 z-50 w-full border-b transition-colors duration-300',
          'bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-xl',
          'border-black/[0.05] dark:border-white/[0.06]',
          'supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-[#0a0a0a]/60'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-1.5 -ml-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                <Bars3Icon className="w-5 h-5" />
              </button>

              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-7 h-7 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center transition-transform group-hover:scale-105">
                  <SparklesIcon className="w-4 h-4 text-white dark:text-black" />
                </div>
                <span className="text-[15px] font-bold tracking-tight text-gray-900 dark:text-white hidden sm:block">
                  Bharat Startup
                </span>
              </Link>

              {/* Future Organization Switcher Preparation Space */}
              <div className="hidden md:flex items-center gap-2 ml-2 pl-4 border-l border-gray-200/80 dark:border-white/10">
                {/* 
                  [Org Avatar] [Current Org Name ▼] 
                  Will be implemented here.
                */}
              </div>

              <div className="hidden md:flex items-center gap-0.5">
                {NAV_ITEMS.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <div key={item.href} className="relative group">
                      <Link
                        href={item.href}
                        className={cn(
                          'relative px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 flex items-center gap-1.5',
                          active
                            ? item.highlight ? 'text-indigo-700 dark:text-indigo-400' : 'text-gray-900 dark:text-white'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-white/[0.05]',
                          item.highlight && 'font-semibold'
                        )}
                      >
                        <item.icon className="w-3.5 h-3.5" />
                        <span>{item.label}</span>
                        {active && (
                          <motion.div
                            layoutId="nav-pill"
                            className={cn(
                              "absolute inset-0 rounded-lg -z-10",
                              item.highlight ? 'bg-indigo-50 dark:bg-indigo-500/10' : 'bg-gray-100 dark:bg-white/[0.06]'
                            )}
                            transition={{ type: 'spring', damping: 24, stiffness: 320 }}
                          />
                        )}
                      </Link>

                      {item.children && (
                        <div className="absolute top-full left-0 pt-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-40">
                          <div className="bg-white dark:bg-[#0f0f10] rounded-xl border border-black/5 dark:border-white/[0.06] shadow-xl p-1.5 min-w-[220px] ring-1 ring-black/5">
                            {item.children.map((child) => (
                              <Link
                                key={child.href}
                                href={child.href}
                                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.05] hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                              >
                                <child.icon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                <span>{child.label}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="hidden md:flex flex-1 max-w-xs mx-4">
              <button
                onClick={() => setCommandOpen(true)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] transition-all duration-150',
                  'bg-gray-100/80 dark:bg-white/[0.04] text-gray-500 dark:text-gray-500',
                  'hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-gray-700 dark:hover:text-gray-300',
                  'border border-transparent hover:border-black/5 dark:hover:border-white/[0.06]',
                  'focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-white/10'
                )}
              >
                <MagnifyingGlassIcon className="w-3.5 h-3.5 text-gray-400 dark:text-gray-600" />
                <span className="flex-1 text-left truncate">Search...</span>
                <kbd className="hidden lg:inline-flex px-1.5 py-0.5 text-[10px] font-mono text-gray-400 dark:text-gray-600 bg-white dark:bg-white/5 rounded border border-gray-200 dark:border-white/10">
                  ⌘K
                </kbd>
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCommandOpen(true)}
                className="md:hidden p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>

              <button
                onClick={toggleDarkMode}
                className="hidden sm:flex p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                aria-label="Toggle theme"
              >
                {darkMode ? <SunIcon className="w-[18px] h-[18px]" /> : <MoonIcon className="w-[18px] h-[18px]" />}
              </button>

              {user && (
                <div className="relative">
                  <button
                    onClick={() => {
                      setNotifOpen(!notifOpen);
                      closeAllMenus();
                      setNotifOpen(!notifOpen);
                    }}
                    className={cn(
                      'relative p-2 rounded-lg transition-all duration-150 active:scale-[0.95]',
                      notifOpen
                        ? 'bg-gray-100 dark:bg-white/[0.06] text-gray-900 dark:text-white'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5'
                    )}
                  >
                    <BellIcon className="w-[18px] h-[18px]" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-[#0a0a0a]" />
                    )}
                  </button>
                  <AnimatePresence>
                    {notifOpen && (
                      <NotificationPanel
                        isOpen={notifOpen}
                        onClose={() => setNotifOpen(false)}
                        notifications={notifications}
                        onMarkRead={markRead}
                        onMarkAllRead={markAllRead}
                      />
                    )}
                  </AnimatePresence>
                </div>
              )}

              {user && (
                <div className="relative hidden md:block">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setCreateMenuOpen(!createMenuOpen);
                      closeAllMenus();
                      setCreateMenuOpen(!createMenuOpen);
                    }}
                    className="ml-1 flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Create</span>
                  </motion.button>
                  <AnimatePresence>
                    {createMenuOpen && (
                      <CreateDropdown
                        isOpen={createMenuOpen}
                        onClose={() => setCreateMenuOpen(false)}
                        onNavigate={handleNavigate}
                      />
                    )}
                  </AnimatePresence>
                </div>
              )}

              {user ? (
                <div className="relative ml-1">
                  <button
                    onClick={() => {
                      setUserMenuOpen(!userMenuOpen);
                      closeAllMenus();
                      setUserMenuOpen(!userMenuOpen);
                    }}
                    className={cn(
                      'flex items-center gap-2 pl-1 pr-1.5 py-1 rounded-lg transition-all duration-150 active:scale-[0.95]',
                      userMenuOpen && 'bg-gray-100 dark:bg-white/[0.06]'
                    )}
                  >
                    <Avatar name={user.email || 'User'} src={user.user_metadata?.avatar_url} size={26} />
                    <ChevronDownIcon className={cn('w-3.5 h-3.5 text-gray-400 transition-transform duration-200', userMenuOpen && 'rotate-180')} />
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <UserDropdown
                        isOpen={userMenuOpen}
                        onClose={() => setUserMenuOpen(false)}
                        user={user}
                        onLogout={handleLogout}
                        onNavigate={handleNavigate}
                      />
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push('/login')}
                    className="hidden sm:block px-3 py-1.5 text-[13px] font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => router.push('/login')}
                    className="px-3 py-1.5 text-[13px] font-medium bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors active:scale-[0.97]"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      <CommandPalette isOpen={commandOpen} onClose={() => setCommandOpen(false)} onNavigate={handleNavigate} />
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} user={user} onLogout={handleLogout} onNavigate={handleNavigate} />

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-black/5 dark:border-white/[0.06] py-1.5 px-2 flex justify-around z-40 pb-safe">
        {NAV_ITEMS.slice(0, 5).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center py-1.5 px-3 rounded-lg transition-colors min-w-[56px]',
              isActive(item.href) ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
            )}
          >
            <item.icon className="w-[18px] h-[18px]" strokeWidth={isActive(item.href) ? 2 : 1.5} />
            <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
          </Link>
        ))}
        {user && (
          <button onClick={handleLogout} className="flex flex-col items-center py-1.5 px-3 text-gray-400 dark:text-gray-500">
            <ArrowRightOnRectangleIcon className="w-[18px] h-[18px]" />
            <span className="text-[10px] mt-0.5">Logout</span>
          </button>
        )}
      </div>
    </>
  );
}