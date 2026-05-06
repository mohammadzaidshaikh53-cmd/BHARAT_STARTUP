// hooks/useUnreadCounts.js
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

const isDev = process.env.NODE_ENV !== 'production';
const STALE_SYNC_INTERVAL = 2 * 60 * 1000;      // 2 minutes – full sync if realtime is "healthy"
const CIRCUIT_BREAKER_MS = 10000;               // 10 seconds max lock
const MAP_CLEANUP_THRESHOLD = 500;
const BACKOFF_BASE = 5000;                      // 5s initial, doubles, max 60s
const TOMBSTONE_TTL = 5000;                     // 5 seconds to keep deleted room IDs

// ---------------------------------------------------------------------------
// Derive totalUnreads from the map (ensures perfect consistency)
// ---------------------------------------------------------------------------
const computeTotal = (map) => {
  let sum = 0;
  for (const v of map.values()) sum += v;
  return sum;
};

export function useUnreadCounts(currentUserId) {
  const [unreadMap, setUnreadMap] = useState(new Map());
  const totalUnreads = useMemo(() => computeTotal(unreadMap), [unreadMap]);

  const resetPromises = useRef(new Map());          // roomId -> Promise
  const lastResetTime = useRef(new Map());          // roomId -> server timestamp (ms) or version
  const circuitTimeouts = useRef(new Map());        // roomId -> timeout handle
  const pendingRevert = useRef(new Map());          // roomId -> previous count (for revert)
  const tombstone = useRef(new Map());              // roomId -> timestamp of deletion (ms)
  const channelRef = useRef(null);
  const broadcastChannelRef = useRef(null);
  const instanceId = useRef(crypto.randomUUID?.() || Math.random().toString(36));
  const lastFullSync = useRef(Date.now());
  const healthyRealtime = useRef(true);
  const pollingTimeoutRef = useRef(null);

  // ---------------------------------------------------------------------------
  // Helper: optimistic update (stores previous value for revert)
  // ---------------------------------------------------------------------------
  const optimisticSet = useCallback((roomId, newCount, storeRevert = false) => {
    setUnreadMap(prev => {
      const oldCount = prev.get(roomId) || 0;
      if (oldCount === newCount) return prev;
      if (storeRevert) pendingRevert.current.set(roomId, oldCount);
      const newMap = new Map(prev);
      newMap.set(roomId, newCount);
      return newMap;
    });
  }, []);

  const revertOptimistic = useCallback((roomId) => {
    const oldCount = pendingRevert.current.get(roomId);
    if (oldCount !== undefined) {
      optimisticSet(roomId, oldCount, false);
      pendingRevert.current.delete(roomId);
    }
  }, [optimisticSet]);

  // ---------------------------------------------------------------------------
  // Full fetch (source of truth) – respects tombstones
  // ---------------------------------------------------------------------------
  const fetchUnreads = useCallback(async (options = { force: false }) => {
    if (!currentUserId) return;
    if (!options.force && healthyRealtime.current && (Date.now() - lastFullSync.current) < STALE_SYNC_INTERVAL) {
      if (isDev) console.log('[unreads] fetch skipped (realtime healthy)');
      return;
    }
    const { data, error } = await supabase
      .from('chat_unreads')
      .select('room_id, unread_count, updated_at_ms')  // assuming a numeric ms column
      .eq('user_id', currentUserId);
    if (error) {
      console.error('[unreads] fetch failed:', error);
      return;
    }
    const newMap = new Map();
    const now = Date.now();
    for (const item of data) {
      const roomId = item.room_id;
      if (tombstone.current.has(roomId) && (now - tombstone.current.get(roomId)) < TOMBSTONE_TTL) {
        continue; // skip recently deleted rooms
      }
      const count = Math.max(0, item.unread_count);
      if (resetPromises.current.has(roomId)) {
        newMap.set(roomId, 0);
      } else {
        newMap.set(roomId, count);
      }
      // Store the numeric timestamp (if available) or fallback to parsing
      const eventTime = item.updated_at_ms ?? (item.updated_at ? new Date(item.updated_at).getTime() : now);
      lastResetTime.current.set(roomId, eventTime);
    }
    for (const [roomId] of resetPromises.current) {
      if (!newMap.has(roomId)) newMap.set(roomId, 0);
    }
    setUnreadMap(newMap);
    lastFullSync.current = now;
  }, [currentUserId]);

  // ---------------------------------------------------------------------------
  // Reset unread (optimistic lock)
  // ---------------------------------------------------------------------------
  const resetUnread = useCallback(async (roomId) => {
    if (!roomId || !currentUserId) return;
    if (resetPromises.current.has(roomId)) return resetPromises.current.get(roomId);

    optimisticSet(roomId, 0, true);

    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: 'RESET_START',
        roomId,
        source: instanceId.current,
      });
    }

    const releaseLock = () => {
      resetPromises.current.delete(roomId);
      circuitTimeouts.current.delete(roomId);
    };

    const breakerTimeout = setTimeout(() => {
      if (resetPromises.current.has(roomId)) {
        if (isDev) console.warn(`[unreads] circuit breaker releasing lock for room ${roomId}`);
        releaseLock();
        if (broadcastChannelRef.current) {
          broadcastChannelRef.current.postMessage({
            type: 'RESET_FINISHED',
            roomId,
            source: instanceId.current,
            success: false,
            timedOut: true,
          });
        }
      }
    }, CIRCUIT_BREAKER_MS);
    circuitTimeouts.current.set(roomId, breakerTimeout);

    const resetPromise = (async () => {
      let serverTimestamp = null;
      try {
        // Expect the RPC to return { updated_at_ms } or { updated_at }
        const { data, error } = await supabase.rpc('reset_unread_counts', { p_room_id: roomId });
        if (error) throw error;
        serverTimestamp = data?.updated_at_ms ?? (data?.updated_at ? new Date(data.updated_at).getTime() : Date.now());
        lastResetTime.current.set(roomId, serverTimestamp);
        pendingRevert.current.delete(roomId);
        if (broadcastChannelRef.current) {
          broadcastChannelRef.current.postMessage({
            type: 'RESET_FINISHED',
            roomId,
            source: instanceId.current,
            success: true,
          });
        }
      } catch (err) {
        console.error('[unreads] reset RPC failed:', err);
        revertOptimistic(roomId);
        if (broadcastChannelRef.current) {
          broadcastChannelRef.current.postMessage({
            type: 'RESET_FINISHED',
            roomId,
            source: instanceId.current,
            success: false,
          });
        }
      } finally {
        clearTimeout(breakerTimeout);
        releaseLock();
      }
    })();

    resetPromises.current.set(roomId, resetPromise);
    return resetPromise;
  }, [currentUserId, optimisticSet, revertOptimistic]);

  // ---------------------------------------------------------------------------
  // Real‑time subscription (INSERT, UPDATE, DELETE)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!currentUserId) return;
    if (channelRef.current) channelRef.current.unsubscribe();
    const channel = supabase.channel(`unreads-${currentUserId}`);
    channelRef.current = channel;

    const handleChange = (payload) => {
      if (!payload.new) return;
      const { room_id, unread_count, updated_at_ms, updated_at } = payload.new;
      if (!room_id) return;
      const eventTime = updated_at_ms ?? (updated_at ? new Date(updated_at).getTime() : null);
      if (eventTime === null) {
        if (isDev) console.warn('[unreads] ignoring event without timestamp', { room_id });
        return;
      }
      const safeCount = Math.max(0, Number(unread_count) || 0);

      setUnreadMap(prev => {
        if (resetPromises.current.has(room_id)) return prev;
        const lastReset = lastResetTime.current.get(room_id);
        if (lastReset && eventTime < lastReset) return prev;
        const oldCount = prev.get(room_id) || 0;
        if (oldCount === safeCount) return prev;
        const newMap = new Map(prev);
        newMap.set(room_id, safeCount);
        return newMap;
      });
    };

    channel
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_unreads', filter: `user_id=eq.${currentUserId}` }, handleChange)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_unreads', filter: `user_id=eq.${currentUserId}` }, handleChange)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'chat_unreads', filter: `user_id=eq.${currentUserId}` }, (payload) => {
        const room_id = payload.old?.room_id;
        if (!room_id) return;
        // Add tombstone to avoid re-adding by concurrent fetch
        tombstone.current.set(room_id, Date.now());
        setUnreadMap(prev => {
          const newMap = new Map(prev);
          newMap.delete(room_id);
          return newMap;
        });
        resetPromises.current.delete(room_id);
        circuitTimeouts.current.delete(room_id);
        lastResetTime.current.delete(room_id);
        pendingRevert.current.delete(room_id);
      })
      .subscribe((status) => {
        healthyRealtime.current = (status === 'SUBSCRIBED');
        if (status === 'SUBSCRIBED') {
          if (isDev) console.log(`[unreads] subscribed for user ${currentUserId}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`[unreads] subscription error for user ${currentUserId}`);
          healthyRealtime.current = false;
        }
      });

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [currentUserId]);

  // ---------------------------------------------------------------------------
  // BroadcastChannel with fallback (storage event)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let bc = null;
    let storageListener = null;
    const lsKey = 'unread_resets';

    const handleResetStart = (roomId) => {
      if (resetPromises.current.has(roomId)) return;
      optimisticSet(roomId, 0, true);
      resetPromises.current.set(roomId, Promise.resolve());
      setTimeout(() => {
        resetPromises.current.delete(roomId);
        pendingRevert.current.delete(roomId);
      }, 3000);
    };
    const handleResetFinished = (roomId, success) => {
      if (!success) revertOptimistic(roomId);
      else pendingRevert.current.delete(roomId);
      resetPromises.current.delete(roomId);
    };

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel('unread_resets');
        broadcastChannelRef.current = bc;
        bc.onmessage = (event) => {
          const { type, roomId, source, success } = event.data;
          if (source === instanceId.current) return;
          if (type === 'RESET_START') handleResetStart(roomId);
          else if (type === 'RESET_FINISHED') handleResetFinished(roomId, success);
        };
      } else {
        // Fallback using localStorage events (works in Safari private mode)
        storageListener = (e) => {
          if (e.key !== lsKey) return;
          try {
            const data = JSON.parse(e.newValue);
            if (data.source === instanceId.current) return;
            if (data.type === 'RESET_START') handleResetStart(data.roomId);
            else if (data.type === 'RESET_FINISHED') handleResetFinished(data.roomId, data.success);
          } catch (err) {}
        };
        window.addEventListener('storage', storageListener);
      }
    } catch (err) {
      if (isDev) console.warn('[unreads] BroadcastChannel fallback to storage', err);
    }

    const broadcast = (type, roomId, success = null) => {
      const msg = { type, roomId, source: instanceId.current, success };
      if (bc) {
        bc.postMessage(msg);
      } else {
        localStorage.setItem(lsKey, JSON.stringify(msg));
        setTimeout(() => localStorage.removeItem(lsKey), 100);
      }
    };

    broadcastChannelRef.current = { postMessage: broadcast };

    return () => {
      if (bc) bc.close();
      if (storageListener) window.removeEventListener('storage', storageListener);
    };
  }, [optimisticSet, revertOptimistic]);

  // ---------------------------------------------------------------------------
  // Exponential backoff polling (recursive setTimeout)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let active = true;
    let delay = BACKOFF_BASE;
    const poll = async () => {
      if (!active) return;
      if (!healthyRealtime.current) {
        await fetchUnreads({ force: true });
        delay = Math.min(delay * 2, 60000);
      } else {
        delay = BACKOFF_BASE;
      }
      if (active) pollingTimeoutRef.current = setTimeout(poll, delay);
    };
    poll();
    return () => {
      active = false;
      if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);
    };
  }, [fetchUnreads]);

  // ---------------------------------------------------------------------------
  // Periodic cleanup of maps and tombstones
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      // Cleanup tombstones older than TTL
      for (const [id, ts] of tombstone.current) {
        if (now - ts > TOMBSTONE_TTL) tombstone.current.delete(id);
      }
      if (lastResetTime.current.size > MAP_CLEANUP_THRESHOLD) {
        const newMap = new Map();
        for (const [roomId, time] of lastResetTime.current) {
          if (!resetPromises.current.has(roomId)) newMap.set(roomId, time);
        }
        lastResetTime.current = newMap;
      }
      if (pendingRevert.current.size > MAP_CLEANUP_THRESHOLD) {
        const newRevert = new Map();
        for (const [roomId, count] of pendingRevert.current) {
          if (!resetPromises.current.has(roomId)) newRevert.set(roomId, count);
        }
        pendingRevert.current = newRevert;
      }
      // Prevent unbounded growth of resetPromises and circuitTimeouts
      if (resetPromises.current.size > MAP_CLEANUP_THRESHOLD) {
        resetPromises.current.clear();
      }
      if (circuitTimeouts.current.size > MAP_CLEANUP_THRESHOLD) {
        for (const t of circuitTimeouts.current.values()) clearTimeout(t);
        circuitTimeouts.current.clear();
      }
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // ---------------------------------------------------------------------------
  // Visibility change – jittered refresh
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        if (!healthyRealtime.current) {
          const jitter = Math.random() * 2000;
          setTimeout(() => fetchUnreads({ force: true }), jitter);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [fetchUnreads]);

  // ---------------------------------------------------------------------------
  // Initial fetch & periodic full sync
  // ---------------------------------------------------------------------------
  useEffect(() => {
    fetchUnreads({ force: true });
    const syncInterval = setInterval(() => {
      fetchUnreads({ force: true });
    }, STALE_SYNC_INTERVAL);
    return () => clearInterval(syncInterval);
  }, [fetchUnreads]);

  const getUnreadCount = useCallback((roomId) => unreadMap.get(roomId) || 0, [unreadMap]);

  return { unreadMap, totalUnreads, getUnreadCount, resetUnread, fetchUnreads };
}