// lib/utils/formatters.js — Shared formatting utilities
// Extracted from duplicated code in products/[id]/page.js and marketplace/category/[slug]/page.js

/**
 * Format price with Indian locale
 */
export function formatPrice(price) {
  if (!price) return '0';
  return Number(price).toLocaleString('en-IN');
}

/**
 * Get human-readable relative time string
 */
export function getRelativeTime(timestamp) {
  if (!timestamp) return null;

  const date = new Date(timestamp);
  const diffMs = Date.now() - date;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Format WhatsApp link from Indian phone number
 */
export function formatWhatsAppLink(number) {
  if (!number) return '#';
  let cleaned = String(number).replace(/\D/g, '');
  if (!cleaned.startsWith('91')) {
    cleaned = `91${cleaned}`;
  }
  return `https://wa.me/${cleaned}`;
}

/**
 * Get deterministic color class for a location string
 */
export function getLocationColor(location) {
  if (!location) return 'bg-gray-100 text-gray-800';

  const colors = [
    'bg-purple-100 text-purple-800',
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-indigo-100 text-indigo-800',
    'bg-yellow-100 text-yellow-800',
    'bg-pink-100 text-pink-800',
    'bg-orange-100 text-orange-800',
    'bg-teal-100 text-teal-800',
  ];

  let hash = 0;
  for (let i = 0; i < location.length; i++) {
    hash = location.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text || '';
  return text.slice(0, maxLength).trim() + '…';
}

/**
 * Format currency with symbol
 */
export function formatCurrency(amount, currency = '₹') {
  if (!amount && amount !== 0) return `${currency}0`;
  return `${currency}${formatPrice(amount)}`;
}
