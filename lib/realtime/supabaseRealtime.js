/**
 * Real-time Supabase Utilities
 * Pattern from: Vercel, Linear, Discord
 *
 * Provides:
 * - Channel management
 * - Connection state handling
 * - Reconnection logic
 * - Presence tracking
 */

import { createClient } from '@/lib/supabase';

// Channel registry for cleanup
const channels = new Map();

// Reconnection config
const RECONNECT_CONFIG = {
  maxRetries: 5,
  baseDelay: 1000,
  maxDelay: 30000,
};

/**
 * Calculate delay with exponential backoff + jitter
 */
function getReconnectDelay(attempt) {
  const exponentialDelay = Math.min(
    RECONNECT_CONFIG.baseDelay * Math.pow(2, attempt),
    RECONNECT_CONFIG.maxDelay
  );
  // Add jitter (±25%)
  const jitter = exponentialDelay * 0.25 * (Math.random() * 2 - 1);
  return exponentialDelay + jitter;
}

/**
 * Create a persistent channel with automatic reconnection
 */
export function createRealtimeChannel(name, config = {}) {
  const supabase = createClient();

  // Clean up existing channel with same name
  if (channels.has(name)) {
    channels.get(name).unsubscribe();
  }

  const channel = supabase.channel(name, {
    config: {
      broadcast: { self: false },
      presence: { key: config.presenceKey },
    },
    ...config,
  });

  // Track connection state
  let connectionState = 'idle';
  let reconnectAttempts = 0;
  let reconnectTimeout = null;

  channel.on('system', { event: '*' }, (payload) => {
    if (payload.type === 'connected') {
      connectionState = 'connected';
      reconnectAttempts = 0;
      config.onConnected?.();
    } else if (payload.type === 'disconnected') {
      connectionState = 'disconnected';
      attemptReconnect();
    }
  });

  function attemptReconnect() {
    if (reconnectAttempts >= RECONNECT_CONFIG.maxRetries) {
      connectionState = 'failed';
      config.onFailed?.();
      return;
    }

    connectionState = 'reconnecting';
    config.onReconnecting?.(reconnectAttempts);

    reconnectTimeout = setTimeout(() => {
      reconnectAttempts++;
      channel.subscribe();
    }, getReconnectDelay(reconnectAttempts));
  }

  channels.set(name, channel);

  return {
    channel,
    state: () => connectionState,

    // Convenience methods
    on: (event, callback) => {
      channel.on(event.table ? 'postgres_changes' : 'broadcast', event, callback);
      return channel;
    },

    trackPresence: (state) => {
      channel.track(state);
    },

    onPresence: (callback) => {
      channel.on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        callback(state);
      });
      channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
        callback(channel.presenceState());
      });
      channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        callback(channel.presenceState());
      });
    },

    cleanup: () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      channel.unsubscribe();
      channels.delete(name);
    },
  };
}

/**
 * Notification channel for real-time updates
 */
export function createNotificationChannel(userId, onNotification) {
  return createRealtimeChannel(`notifications:${userId}`, {
    filter: {
      type: 'postgres_changes',
      config: {
        event: 'INSERT',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
    },
    onConnected: () => console.log(`[Realtime] Subscribed to notifications for user ${userId}`),
    onReconnecting: (attempt) => console.log(`[Realtime] Reconnecting notifications (attempt ${attempt})`),
    onFailed: () => console.error(`[Realtime] Failed to subscribe to notifications`),
  });
}

/**
 * Chat channel for real-time messages
 */
export function createChatChannel(roomId, onMessage, onTyping) {
  return createRealtimeChannel(`chat:${roomId}`, {
    presenceKey: `user:${roomId}`,
    onConnected: () => console.log(`[Realtime] Joined chat room ${roomId}`),
  });
}

/**
 * Presence channel for online status
 */
export function createPresenceChannel(roomKey, onPresenceChange) {
  return createRealtimeChannel(`presence:${roomKey}`, {
    presenceKey: roomKey,
  });
}

/**
 * Broadcast channel for typing indicators
 */
export function createTypingChannel(roomId) {
  return createRealtimeChannel(`typing:${roomId}`, {
    config: {
      broadcast: { self: false },
    },
  });
}

/**
 * Product/Live update channel
 */
export function createProductUpdatesChannel(productId, onUpdate) {
  return createRealtimeChannel(`product:${productId}`, {
    filter: {
      type: 'postgres_changes',
      config: {
        event: 'UPDATE',
        table: 'products',
        filter: `id=eq.${productId}`,
      },
    },
  });
}

/**
 * Event updates channel
 */
export function createEventUpdatesChannel(eventId, onUpdate) {
  return createRealtimeChannel(`event:${eventId}`, {
    filter: {
      type: 'postgres_changes',
      config: {
        event: '*',
        table: 'events',
        filter: `id=eq.${eventId}`,
      },
    },
  });
}

/**
 * Clean up all channels
 */
export function cleanupAllChannels() {
  channels.forEach((channel) => channel.unsubscribe());
  channels.clear();
}

/**
 * Get connection status for all channels
 */
export function getChannelStatus() {
  const status = {};
  channels.forEach((channel, name) => {
    status[name] = channel.state === 'joined';
  });
  return status;
}
