'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Bell, MessageSquare, Heart, Users, Calendar, Settings, AlertCircle, Check, X } from 'lucide-react';
import { ScrollReveal, StaggerReveal, StaggerItem, staggerItemVariants } from '@/components/motion';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/forms';
import { useUIStore } from '@/lib/store';

const springTransition = {
  type: 'spring',
  stiffness: 350,
  damping: 28,
};

// Mock notifications
const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'inquiry',
    title: 'New RFQ Received',
    message: 'TechMart India is interested in your "Industrial Sensors" product',
    time: '5 minutes ago',
    read: false,
    link: '/rfq/123',
  },
  {
    id: '2',
    type: 'order',
    title: 'Order Completed',
    message: 'Order #ORD-2024-156 has been successfully delivered',
    time: '1 hour ago',
    read: false,
    link: '/dashboard/orders/156',
  },
  {
    id: '3',
    type: 'message',
    title: 'New Message',
    message: 'Priya Sharma sent you a message about bulk pricing',
    time: '3 hours ago',
    read: true,
    link: '/chat/456',
  },
  {
    id: '4',
    type: 'event',
    title: 'Event Reminder',
    message: 'Auto Expo 2024 starts in 2 days. Don\'t forget to visit!',
    time: '1 day ago',
    read: true,
    link: '/events/789',
  },
];

const NOTIFICATION_TYPES = [
  { id: 'all', label: 'All', icon: Bell, count: MOCK_NOTIFICATIONS.length },
  { id: 'inquiry', label: 'RFQs', icon: MessageSquare, count: 1 },
  { id: 'order', label: 'Orders', icon: Heart, count: 1 },
  { id: 'message', label: 'Messages', icon: Users, count: 1 },
  { id: 'event', label: 'Events', icon: Calendar, count: 1 },
];

const SETTINGS = [
  { id: 'email', label: 'Email Notifications', description: 'Receive updates via email', enabled: true },
  { id: 'push', label: 'Push Notifications', description: 'Browser push notifications', enabled: true },
  { id: 'rfq', label: 'RFQ Alerts', description: 'Get notified when new RFQs match your products', enabled: true },
  { id: 'order', label: 'Order Updates', description: 'Order status changes', enabled: true },
  { id: 'marketing', label: 'Marketing', description: 'Promotional content and tips', enabled: false },
];

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [settings, setSettings] = useState(SETTINGS);
  const markAllRead = useUIStore((state) => state.markAllRead);

  const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.read).length;
  const filteredNotifications = activeTab === 'all'
    ? MOCK_NOTIFICATIONS
    : MOCK_NOTIFICATIONS.filter(n => n.type === activeTab);

  const toggleSetting = (id) => {
    setSettings(prev => prev.map(s =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  };

  return (
    <div className="container-app py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Notifications</h1>
              <p className="text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllRead}>
                Mark all as read
              </Button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {NOTIFICATION_TYPES.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap
                  transition-all duration-200
                  ${activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }
                `}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`
                    px-1.5 py-0.5 rounded-full text-xs
                    ${activeTab === tab.id ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'}
                  `}>
                    {tab.count}
                  </span>
                )}
              </motion.button>
            ))}
          </div>

          {/* Notifications List */}
          <StaggerReveal className="space-y-3">
            {filteredNotifications.map((notification) => (
              <StaggerItem key={notification.id}>
                <motion.a
                  href={notification.link}
                  whileHover={{ scale: 1.01 }}
                  className={`
                    block card-premium p-4 transition-all duration-200
                    ${!notification.read ? 'bg-primary/5 border-primary/20' : ''}
                  `}
                >
                  <div className="flex gap-4">
                    <div className={`
                      w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                      ${!notification.read ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-gray-800 text-muted-foreground'}
                    `}>
                      {notification.type === 'inquiry' && <MessageSquare className="w-5 h-5" />}
                      {notification.type === 'order' && <Heart className="w-5 h-5" />}
                      {notification.type === 'message' && <Users className="w-5 h-5" />}
                      {notification.type === 'event' && <Calendar className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className={`font-semibold ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-muted-foreground">{notification.time}</span>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.a>
              </StaggerItem>
            ))}
          </StaggerReveal>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Notification Settings */}
          <ScrollReveal>
            <div className="card-premium p-6">
              <div className="flex items-center gap-2 mb-6">
                <Settings className="w-5 h-5 text-muted-foreground" />
                <h2 className="font-bold">Preferences</h2>
              </div>
              <div className="space-y-4">
                {settings.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{setting.label}</p>
                      <p className="text-xs text-muted-foreground">{setting.description}</p>
                    </div>
                    <Toggle
                      checked={setting.enabled}
                      onChange={() => toggleSetting(setting.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Quick Actions */}
          <ScrollReveal delay={0.1}>
            <div className="card-premium p-6">
              <h2 className="font-bold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start gap-3">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Mark all as read
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-3">
                  <X className="w-4 h-4 text-red-500" />
                  Clear all notifications
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
