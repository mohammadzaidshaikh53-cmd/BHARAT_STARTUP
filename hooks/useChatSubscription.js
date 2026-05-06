// hooks/useChatSubscription.js
import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export function useChatSubscription({
  roomId,
  currentUserId,
  onNewMessage,
  onUpdateMessage,
  autoScrollRef,
  scrollToBottom,
}) {
  // Refs to stabilise callbacks
  const onNewMessageRef = useRef(onNewMessage);
  const onUpdateMessageRef = useRef(onUpdateMessage);
  const autoScrollRefRef = useRef(autoScrollRef);
  const scrollToBottomRef = useRef(scrollToBottom);

  useEffect(() => {
    onNewMessageRef.current = onNewMessage;
    onUpdateMessageRef.current = onUpdateMessage;
    autoScrollRefRef.current = autoScrollRef;
    scrollToBottomRef.current = scrollToBottom;
  }, [onNewMessage, onUpdateMessage, autoScrollRef, scrollToBottom]);

  // Deduplication map (cleared when roomId changes)
  const seenMessages = useRef(new Set());

  // Debounce mark‑as‑read
  const markReadTimeout = useRef(null);

  useEffect(() => {
    if (!roomId || !currentUserId) return;

    // Reset seen messages when room changes
    seenMessages.current.clear();

    const messagesChannel = supabase
      .channel(`room-${roomId}-messages-${currentUserId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${roomId}`,
      }, (payload) => {
        if (!payload.new) return;
        const newMsg = payload.new;

        // Deduplicate (Supabase may resend same message)
        if (seenMessages.current.has(newMsg.id)) return;
        seenMessages.current.add(newMsg.id);

        // Call onNewMessage callback
        onNewMessageRef.current?.(newMsg);

        // Auto‑scroll if needed
        if (autoScrollRefRef.current?.current) {
          scrollToBottomRef.current?.();
        }

        // Mark messages as read (debounced)
        if (newMsg.user_id !== currentUserId) {
          if (markReadTimeout.current) clearTimeout(markReadTimeout.current);
          markReadTimeout.current = setTimeout(() => {
            supabase.rpc('mark_messages_read', { p_room_id: roomId });
          }, 500);
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${roomId}`,
      }, (payload) => {
        if (!payload.new) return;
        onUpdateMessageRef.current?.(payload.new);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`✅ Subscribed to chat room ${roomId}`);
        }
        if (status === 'CHANNEL_ERROR') {
          console.error(`❌ Subscription error for room ${roomId}`);
        }
      });

    return () => {
      if (markReadTimeout.current) clearTimeout(markReadTimeout.current);
      messagesChannel.unsubscribe();
    };
  }, [roomId, currentUserId]); // Only re‑run when room or user changes
}