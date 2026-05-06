'use client';

import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { throttle } from 'lodash';

const BATCH_URL = process.env.NEXT_PUBLIC_ENGAGEMENT_BATCH_URL || '/api/engagement/batch';

function sendBeacon(events) {
  if (!events?.length) return;
  const payload = JSON.stringify({ events });
  const blob = new Blob([payload], { type: 'application/json' });

  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    try {
      if (navigator.sendBeacon(BATCH_URL, blob)) return;
    } catch (e) { /* fall through */ }
  }

  try {
    fetch(BATCH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  } catch (e) { /* silent */ }
}

export default function EngagementTracker({ postId, postUrl }) {
  const startTimeRef = useRef(Date.now());
  const maxScrollRef = useRef(0);
  const milestonesRef = useRef(new Set());
  const userIdRef = useRef(null);
  const flushTimerRef = useRef(null);

  const queue = useCallback((type, metadata = {}) => {
    if (!userIdRef.current) return;
    const event = {
      user_id: userIdRef.current,
      post_id: postId,
      event_type: type,
      metadata: { ...metadata, url: postUrl, ts: Date.now() },
    };
    // Critical events flush immediately; others debounce slightly
    if (type === 'page_exit' || type === 'read_complete') {
      sendBeacon([event]);
    } else {
      // Simple in-memory batching (1.5s window)
      if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
      flushTimerRef.current = setTimeout(() => sendBeacon([event]), 1500);
    }
  }, [postId, postUrl]);

  useEffect(() => {
    // Resolve user
    supabase.auth.getSession().then(({ data: { session } }) => {
      userIdRef.current = session?.user?.id || null;
      if (userIdRef.current) queue('page_view', { referrer: document.referrer });
    });

    // Scroll depth with milestones
    const onScroll = throttle(() => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      if (docH <= 0) return;
      const depth = Math.min(1, window.scrollY / docH);
      if (depth > maxScrollRef.current) maxScrollRef.current = depth;

      [0.25, 0.5, 0.75, 0.95].forEach((m) => {
        const key = `${Math.round(m * 100)}`;
        if (depth >= m && !milestonesRef.current.has(key)) {
          milestonesRef.current.add(key);
          const type = m === 0.95 ? 'read_complete' : 'scroll_depth';
          queue(type, { depth: m });
        }
      });
    }, 400);

    window.addEventListener('scroll', onScroll, { passive: true });

    // Attention heartbeat (every 10s)
    const heartbeat = setInterval(() => {
      if (!userIdRef.current) return;
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      queue('attention', { duration });
    }, 10000);

    // Page lifecycle
    const onVisChange = () => {
      if (document.visibilityState === 'hidden') flushExit();
    };
    const onBeforeUnload = () => flushExit();

    const flushExit = () => {
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      queue('page_exit', { duration, max_scroll: parseFloat(maxScrollRef.current.toFixed(3)) });
    };

    document.addEventListener('visibilitychange', onVisChange);
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      window.removeEventListener('scroll', onScroll);
      onScroll.cancel();
      clearInterval(heartbeat);
      document.removeEventListener('visibilitychange', onVisChange);
      window.removeEventListener('beforeunload', onBeforeUnload);
      flushExit();
      if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    };
  }, [queue]);

  return null;
}