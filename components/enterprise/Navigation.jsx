/**
 * Enterprise Navigation System
 * Pattern from: Stripe, Linear, Notion, Vercel
 */

'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  ShoppingBag,
  FileText,
  Users,
  Calendar,
  MessageSquare,
  Building2,
  Store,
  Settings,
  ChevronRight,
  ChevronDown,
  Bell,
  Search,
  Plus,
  LogOut,
  User,
  Shield,
  Crown,
} from 'lucide-react';
import { CommandPalette, CommandPaletteTrigger } from '@/components/command/CommandPalette';

const springTransition = {
  type: 'spring',
  stiffness: 350,
  damping: 28,
};

/**
 * Main Navigation Sidebar
 */
export function Sidebar({
  collapsed = false,
  onToggle,
  className = '',
}) {
  const pathname = usePathname();
  const [commandOpen, setCommandOpen] = useState(false);

  const mainNavItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
    { href: '/rfq', label: 'RFQ', icon: FileText },
    { href: '/community', label: 'Community', icon: Users },
    { href: '/events', label: 'Events', icon: Calendar },
    { href: '/chat', label: 'Chat', icon: MessageSquare },
  ];

  const secondaryNavItems = [
    { href: '/stores', label: 'Stores', icon: Store },
    { href: '/organizations', label: 'Organizations', icon: Building2 },
    { href: '/premium/plans', label: 'Premium', icon: Crown },
  ];

  const bottomNavItems = [
    { href: '/notifications', label: 'Notifications', icon: Bell, badge: 3 },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={springTransition}
        className={`
          fixed left-0 top-0 h-full z-40
          bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800
          flex flex-col
          ${className}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 dark:border-gray-800">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white font-bold text-lg">1S</span>
            </div>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold text-lg"
              >
                One Solution
              </motion.span>
            )}
          </Link>
        </div>

        {/* Command Palette */}
        {!collapsed && (
          <div className="px-3 py-3">
            <CommandPaletteTrigger onClick={() => setCommandOpen(true)} />
          </div>
        )}

        {/* Main Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl
                    transition-colors duration-200
                    ${isActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-foreground'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </motion.div>
              </Link>
            );
          })}

          {/* Divider */}
          <div className="h-px bg-gray-100 dark:bg-gray-800 my-4" />

          {/* Secondary Navigation */}
          {secondaryNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl
                    transition-colors duration-200
                    ${isActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-foreground'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-foreground transition-colors"
                >
                  <div className="relative">
                    <Icon className="w-5 h-5" />
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  {!collapsed && <span>{item.label}</span>}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </motion.aside>

      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
    </>
  );
}

/**
 * Breadcrumb Navigation
 */
export function Breadcrumbs({ items = [], className = '' }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center gap-1 text-sm">
        <li>
          <Link
            href="/"
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="w-4 h-4" />
          </Link>
        </li>

        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            {item.href ? (
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Tab Navigation
 */
export function TabNav({
  tabs = [],
  activeTab,
  onChange,
  variant = 'underline', // 'underline' | 'pills' | 'boxed'
  className = '',
}) {
  return (
    <div className={`flex gap-1 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;

        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={`
              relative px-4 py-2 text-sm font-medium rounded-lg transition-colors
              ${variant === 'underline' ? '' : ''}
              ${isActive
                ? variant === 'underline'
                  ? 'text-foreground'
                  : variant === 'pills'
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-gray-800 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800'
              }
            `}
          >
            <span className="flex items-center gap-2">
              {tab.icon && <tab.icon className="w-4 h-4" />}
              {tab.label}
            </span>
            {variant === 'underline' && isActive && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                transition={springTransition}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
