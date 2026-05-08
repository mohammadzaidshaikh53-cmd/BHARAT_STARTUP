'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { User, Building, Bell, Shield, CreditCard, Globe, Key, Save } from 'lucide-react';
import { ScrollReveal, PhysicsCard } from '@/components/motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/forms';
import { VerticalTabs } from '@/components/navigation';
import { Alert } from '@/components/feedback';

const springTransition = {
  type: 'spring',
  stiffness: 350,
  damping: 28,
};

const TABS = [
  {
    value: 'profile',
    label: 'Profile',
    icon: User,
    description: 'Personal information',
  },
  {
    value: 'company',
    label: 'Company',
    icon: Building,
    description: 'Business details',
  },
  {
    value: 'notifications',
    label: 'Notifications',
    icon: Bell,
    description: 'Alert preferences',
  },
  {
    value: 'security',
    label: 'Security',
    icon: Shield,
    description: 'Password & 2FA',
  },
  {
    value: 'billing',
    label: 'Billing',
    icon: CreditCard,
    description: 'Plans & payments',
  },
];

function ProfileTab() {
  return (
    <div className="space-y-6">
      <div className="card-premium p-6">
        <h3 className="font-bold mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Full Name</label>
            <Input defaultValue="Rajesh Kumar" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <Input defaultValue="rajesh@techmart.in" type="email" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Phone</label>
            <Input defaultValue="+91 98765 43210" type="tel" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Location</label>
            <Input defaultValue="Mumbai, Maharashtra" />
          </div>
        </div>
      </div>

      <div className="card-premium p-6">
        <h3 className="font-bold mb-4">Bio</h3>
        <textarea
          rows={4}
          defaultValue="Founder of TechMart India, specializing in industrial electronics and embedded systems. 10+ years of experience in B2B electronics distribution."
          className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
        />
      </div>

      <Button className="gap-2">
        <Save className="w-4 h-4" />
        Save Changes
      </Button>
    </div>
  );
}

function CompanyTab() {
  return (
    <div className="space-y-6">
      <div className="card-premium p-6">
        <h3 className="font-bold mb-4">Business Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1.5">Company Name</label>
            <Input defaultValue="TechMart India Pvt. Ltd." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">GST Number</label>
            <Input defaultValue="27AAACT1234P1Z5" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Business Type</label>
            <Input defaultValue="Private Limited" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1.5">Address</label>
            <Input defaultValue="123 Industrial Area, Andheri East, Mumbai 400069" />
          </div>
        </div>
      </div>

      <div className="card-premium p-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-bold">Verification Status</h3>
          <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-xs font-medium">
            Verified
          </span>
        </div>
        <Alert type="success" title="Your business is verified">
          You have completed KYC verification. Your verified badge is displayed on your profile and listings.
        </Alert>
      </div>
    </div>
  );
}

function NotificationsTab() {
  const [settings, setSettings] = useState({
    email: true,
    push: true,
    rfq: true,
    orders: true,
    marketing: false,
  });

  return (
    <div className="space-y-6">
      <div className="card-premium p-6">
        <h3 className="font-bold mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          {Object.entries(settings).map(([key, enabled]) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
              <div>
                <p className="font-medium capitalize">{key}</p>
                <p className="text-sm text-muted-foreground">
                  {key === 'email' && 'Receive updates via email'}
                  {key === 'push' && 'Browser push notifications'}
                  {key === 'rfq' && 'New RFQs matching your products'}
                  {key === 'orders' && 'Order status updates'}
                  {key === 'marketing' && 'Promotional content'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setSettings(prev => ({ ...prev, [key]: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SecurityTab() {
  return (
    <div className="space-y-6">
      <div className="card-premium p-6">
        <h3 className="font-bold mb-4">Change Password</h3>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium mb-1.5">Current Password</label>
            <Input type="password" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">New Password</label>
            <Input type="password" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Confirm New Password</label>
            <Input type="password" />
          </div>
          <Button variant="outline" className="gap-2">
            <Key className="w-4 h-4" />
            Update Password
          </Button>
        </div>
      </div>

      <div className="card-premium p-6">
        <h3 className="font-bold mb-4">Two-Factor Authentication</h3>
        <Alert type="info" title="Add an extra layer of security">
          Enable 2FA to protect your account from unauthorized access.
        </Alert>
        <Button variant="outline" className="mt-4 gap-2">
          <Shield className="w-4 h-4" />
          Enable 2FA
        </Button>
      </div>
    </div>
  );
}

function BillingTab() {
  return (
    <div className="space-y-6">
      <div className="card-premium p-6">
        <h3 className="font-bold mb-4">Current Plan</h3>
        <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl">
          <div>
            <p className="text-lg font-bold">Pro Plan</p>
            <p className="text-sm text-muted-foreground">₹2,999/month</p>
          </div>
          <Button variant="outline">Upgrade</Button>
        </div>
      </div>

      <div className="card-premium p-6">
        <h3 className="font-bold mb-4">Payment Method</h3>
        <div className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
          <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center text-white text-xs font-bold">
            VISA
          </div>
          <div className="flex-1">
            <p className="font-medium">•••• •••• •••• 4242</p>
            <p className="text-sm text-muted-foreground">Expires 12/25</p>
          </div>
          <Button variant="ghost" size="sm">Update</Button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="container-app py-8">
      <ScrollReveal>
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>
      </ScrollReveal>

      <VerticalTabs
        tabs={[
          { ...TABS[0], content: <ProfileTab /> },
          { ...TABS[1], content: <CompanyTab /> },
          { ...TABS[2], content: <NotificationsTab /> },
          { ...TABS[3], content: <SecurityTab /> },
          { ...TABS[4], content: <BillingTab /> },
        ]}
        defaultTab="profile"
      />
    </div>
  );
}
