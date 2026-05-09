// components/chat/ChatRoom.js
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Avatar } from '@/components/common/Avatar';
import { Composer } from './Composer';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { Button } from '@/components/common/Button';
import { ChevronLeftIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const springConfig = { type: 'spring', stiffness: 350, damping: 28 };

// Helper to get full error details
function getErrorMessage(error) {
  if (!error) return 'Unknown error';
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  if (error.details) return error.details;
  return JSON.stringify(error);
}

export function ChatRoom({ roomId, currentUserId, onOpenInfoPanel }) {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [roomDetails, setRoomDetails] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const autoScrollRef = useRef(true);
  const scrollTimeoutRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Define fetchData outside useEffect so it can be called on retry
  const fetchData = useCallback(async () => {
    if (!roomId) return;
    try {
      setMessages([]);
      setRoomDetails(null);
      setError(null);
      setLoading(true);

      // 1. Fetch room details
      const { data: room, error: roomError } = await supabase
        .from('chat_rooms')
        .select('id, name, is_group')
        .eq('id', roomId)
        .single();

      if (roomError) throw new Error(`Room fetch failed: ${getErrorMessage(roomError)}`);
      setRoomDetails(room);

      // 2. Fetch messages
      const { data: msgs, error: msgError } = await supabase
        .from('chat_messages')
        .select('id, content, created_at, sender_id')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (msgError) throw new Error(`Messages fetch failed: ${getErrorMessage(msgError)}`);
      setMessages(msgs || []);

      // 3. Mark messages as read (optional RPC)
      try {
        await supabase.rpc('mark_messages_read', { p_room_id: roomId });
      } catch (e) {
        console.warn('mark_messages_read RPC not available:', getErrorMessage(e));
      }
    } catch (err) {
      console.error('ChatRoom fetch error:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  // Initial fetch
  useEffect(() => {
    fetchData();
    scrollTimeoutRef.current = setTimeout(() => scrollToBottom(), 100);
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [fetchData, scrollToBottom]);

  // Realtime subscriptions
  useEffect(() => {
    if (!roomId) return;

    const messagesChannel = supabase
      .channel(`room-${roomId}-messages`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${roomId}`,
      }, (payload) => {
        const newMsg = payload.new;
        if (!newMsg) return;
        setMessages(prev => [...prev, newMsg]);
        if (autoScrollRef.current) {
          setTimeout(() => scrollToBottom(), 50);
        }
        if (newMsg.sender_id !== currentUserId) {
          try {
            supabase.rpc('mark_messages_read', { p_room_id: roomId }).catch(() => {});
          } catch (e) {}
        }
      })
      .subscribe();

    // Typing indicator (optional)
    let typingChannel = null;
    try {
      typingChannel = supabase
        .channel(`room-${roomId}-typing`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'typing_events',
          filter: `room_id=eq.${roomId}`,
        }, (payload) => {
          if (!payload.new) return;
          if (payload.new.user_id === currentUserId) return;
          if (payload.new.is_typing) {
            setTypingUsers(prev => [...new Set([...prev, payload.new.user_id])]);
          } else {
            setTypingUsers(prev => prev.filter(id => id !== payload.new.user_id));
          }
        })
        .subscribe();
    } catch (e) {
      console.warn('Typing indicator not available');
    }

    return () => {
      supabase.removeChannel(messagesChannel);
      if (typingChannel) supabase.removeChannel(typingChannel);
    };
  }, [roomId, currentUserId]);

  const handleSend = useCallback(async (payload) => {
    const messageText = payload?.text;
    if (!messageText || !messageText.trim()) {
      console.warn('Empty message, not sending');
      return;
    }
    if (sending) {
      console.warn('Already sending, ignoring');
      return;
    }
    if (!roomId) {
      console.error('No roomId, cannot send');
      setError('Cannot send: no room selected');
      return;
    }
    if (!currentUserId) {
      console.error('No currentUserId, cannot send');
      setError('You must be logged in to send messages');
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.from('chat_messages').insert({
        room_id: roomId,
        sender_id: currentUserId,
        content: messageText.trim(),
      });
      if (error) {
        // Detailed error logging
        console.error('Send error detail:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          status: error.status
        });
        // If RLS error on unreads, message may still be inserted but unread update failed
        if (error.message?.includes('row-level security') && error.message?.includes('chat_unreads')) {
          setError('Message sent, but unread counts could not be updated. Please contact support.');
        } else {
          throw new Error(error.message || 'Failed to send message');
        }
      } else {
        // Message sent successfully
        setError(null);
      }
    } catch (err) {
      console.error('Send error:', err);
      setError(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  }, [roomId, currentUserId, sending]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
    autoScrollRef.current = isNearBottom;
  }, []);

  const handleTyping = useCallback(async (isTyping) => {
    try {
      await supabase.rpc('set_typing', { p_room_id: roomId, p_is_typing: isTyping });
    } catch (err) {
      console.warn('Typing RPC not available');
    }
  }, [roomId]);

  if (!roomId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-text-secondary gap-4">
        <p className="text-lg">Select a conversation</p>
        <Button variant="primary" onClick={() => router.push('/marketplace')}>Browse products</Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-status-error gap-4 px-4">
        <p className="text-lg text-center">Error: {error}</p>
        <Button variant="primary" onClick={fetchData}>Retry</Button>
      </div>
    );
  }

  const roomName = roomDetails?.is_group
    ? roomDetails.name || 'Group Chat'
    : 'Private Chat';

  // Transform DB message to what MessageBubble expects
  const transformedMessages = messages.map(msg => ({
    ...msg,
    user_id: msg.sender_id,
    message: msg.content,
  }));

  return (
    <div className="flex flex-col h-full bg-bg-base">
      <div className="flex items-center gap-3 p-3 border-b border-white/10 bg-bg-raised/80 backdrop-blur-sm">
        <button
          onClick={() => router.push('/marketplace')}
          className="text-sm text-accent-primary hover:underline flex items-center gap-1"
        >
          ← Back to Marketplace
        </button>
      </div>

      <div className="sticky top-0 z-10 bg-bg-raised/80 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={springConfig}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="md:hidden"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </Button>
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={springConfig}
            >
              <Avatar name={roomName} size={40} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...springConfig, delay: 0.1 }}
            >
              <h2 className="font-semibold text-text-primary">{roomName}</h2>
              <p className="text-caption text-text-tertiary">
                {roomDetails?.is_group ? 'Group chat' : 'Private conversation'}
              </p>
            </motion.div>
          </div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={springConfig}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenInfoPanel}
              aria-label="Room info"
            >
              <InformationCircleIcon className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </div>

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
      >
        <AnimatePresence initial={false}>
          {transformedMessages.length === 0 ? (
            <div className="flex justify-center items-center h-full text-gray-500">
              No messages yet. Say hello!
            </div>
          ) : (
            transformedMessages.map((msg, idx) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.sender_id === currentUserId}
                showAvatar={idx === 0 || transformedMessages[idx-1]?.sender_id !== msg.sender_id}
              />
            ))
          )}
        </AnimatePresence>
        <TypingIndicator users={typingUsers} />
        <div ref={messagesEndRef} />
      </div>

      <Composer
        roomId={roomId}
        onSend={handleSend}
        onTyping={handleTyping}
        disabled={sending}
      />
    </div>
  );
}