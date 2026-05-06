// components/chat/TypingIndicator.js
'use client';

import { memo, useMemo, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from '@/components/common/Avatar';

const DOT_ANIMATION = { opacity: [0.3, 1, 0.3] };
const DOT_TRANSITION = { duration: 1.2, repeat: Infinity };
const TYPING_TTL = 5000; // 5 seconds without an update → user stops typing

// Helper: check if user prefers reduced motion
const useReducedMotion = () => {
  const [prefersReduced, setPrefersReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPrefersReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return prefersReduced;
};

// Normalize any user shape to a stable object with id, name, email
const normalizeUser = (u) => {
  if (!u) return null;
  if (typeof u === 'string') return { id: u, name: null, email: null };
  if (typeof u === 'object') {
    return {
      id: u.id ?? u.user_id ?? null,
      name: u.name ?? null,
      email: u.email ?? null,
    };
  }
  return null;
};

export const TypingIndicator = memo(function TypingIndicator({ users = [] }) {
  const [activeUsers, setActiveUsers] = useState(new Map()); // Map<id, { name, email, lastSeen }>
  const prefersReduced = useReducedMotion();

  // Update active users map whenever `users` prop changes
  useEffect(() => {
    const now = Date.now();
    const newMap = new Map();

    // Add / update incoming users
    for (const raw of users) {
      const user = normalizeUser(raw);
      if (!user?.id) continue;
      const existing = activeUsers.get(user.id);
      newMap.set(user.id, {
        id: user.id,
        name: user.name ?? existing?.name,
        email: user.email ?? existing?.email,
        lastSeen: now,
      });
    }

    // Preserve existing users that haven't expired yet
    for (const [id, data] of activeUsers) {
      if (!newMap.has(id) && (now - data.lastSeen) < TYPING_TTL) {
        newMap.set(id, data);
      }
    }

    setActiveUsers(newMap);
  }, [users]);

  // Periodically clean up stale entries (every 2 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(prev => {
        const now = Date.now();
        let changed = false;
        for (const [id, data] of prev) {
          if (now - data.lastSeen >= TYPING_TTL) {
            prev.delete(id);
            changed = true;
          }
        }
        return changed ? new Map(prev) : prev;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const originalCount = activeUsers.size;
  if (originalCount === 0) return null;

  // Build display list (up to 3, but keep full count)
  const displayedUsers = Array.from(activeUsers.values()).slice(0, 3);

  // Generate message with grammar
  const getMessage = () => {
    const names = displayedUsers.map(u => u.name || u.email || u.id.slice(0, 6));
    if (originalCount === 1) return `${names[0]} is typing`;
    if (originalCount === 2) return `${names[0]} and ${names[1]} are typing`;
    if (originalCount === 3) return `${names[0]}, ${names[1]} and ${names[2]} are typing`;
    return `${names[0]}, ${names[1]} and ${originalCount - 2} others are typing`;
  };

  const message = getMessage();

  return (
    <AnimatePresence>
      <motion.div
        key="typing-indicator"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-3 text-text-tertiary text-sm px-4 py-2"
        aria-live="polite"
        aria-atomic="true"
      >
        {/* Avatar stack */}
        <div className="flex -space-x-2">
          {displayedUsers.map((user, i) => (
            <div
              key={user.id}
              className="relative ring-2 ring-bg-base rounded-full"
              style={{ zIndex: displayedUsers.length - i }}
            >
              <Avatar name={user.name || user.email || user.id} size={24} />
            </div>
          ))}
        </div>

        <span>{message}</span>

        {!prefersReduced && (
          <span className="flex gap-1" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={DOT_ANIMATION}
                transition={{ ...DOT_TRANSITION, delay: i * 0.2 }}
                className="w-1.5 h-1.5 bg-accent-primary rounded-full"
              />
            ))}
          </span>
        )}
      </motion.div>
    </AnimatePresence>
  );
});