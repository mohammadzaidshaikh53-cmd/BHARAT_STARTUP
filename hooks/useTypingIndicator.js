// hooks/useTypingIndicator.js
import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export function useTypingIndicator({ roomId, currentUserId }) {
  const [typingUsers, setTypingUsers] = useState(new Set()); // use Set internally
  const typingTimeouts = useRef({});
  const lastTypingEmit = useRef(0);
  const channelRef = useRef(null);
  const typingUsersSet = useRef(new Set());

  // Broadcast the "typing" event (throttled to once per 500ms)
  const broadcastTyping = useCallback(() => {
    const now = Date.now();
    if (now - lastTypingEmit.current < 500) return;
    lastTypingEmit.current = now;

    channelRef.current?.send({
      type: 'broadcast',
      event: 'typing',
      payload: { user_id: currentUserId, is_typing: true },
    });
  }, [currentUserId]);

  const broadcastStopTyping = useCallback(() => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'typing',
      payload: { user_id: currentUserId, is_typing: false },
    });
  }, [currentUserId]);

  // Listen to broadcast events
  useEffect(() => {
    if (!roomId || !currentUserId) return;

    const channel = supabase.channel(`room-${roomId}-typing`, {
      config: { broadcast: { self: false } }, // don't receive our own events
    });
    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        const { user_id, is_typing } = payload;
        if (user_id === currentUserId) return;

        if (is_typing) {
          // Add to Set
          if (!typingUsersSet.current.has(user_id)) {
            typingUsersSet.current.add(user_id);
            setTypingUsers(new Set(typingUsersSet.current));
          }
          // Auto‑remove after 3 seconds (safety net)
          clearTimeout(typingTimeouts.current[user_id]);
          typingTimeouts.current[user_id] = setTimeout(() => {
            if (typingUsersSet.current.has(user_id)) {
              typingUsersSet.current.delete(user_id);
              setTypingUsers(new Set(typingUsersSet.current));
            }
          }, 3000);
        } else {
          // Explicit stop typing
          if (typingUsersSet.current.has(user_id)) {
            typingUsersSet.current.delete(user_id);
            setTypingUsers(new Set(typingUsersSet.current));
          }
          clearTimeout(typingTimeouts.current[user_id]);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') console.log(`✅ Typing broadcast ready for room ${roomId}`);
        if (status === 'CHANNEL_ERROR') console.error(`❌ Typing broadcast error for room ${roomId}`);
      });

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
      // Clear all timeouts on unmount
      Object.values(typingTimeouts.current).forEach(clearTimeout);
      typingTimeouts.current = {};
      typingUsersSet.current.clear();
    };
  }, [roomId, currentUserId]);

  // Return a function to convert Set to array for display
  const typingList = Array.from(typingUsers);

  return { typingUsers: typingList, broadcastTyping, broadcastStopTyping };
}