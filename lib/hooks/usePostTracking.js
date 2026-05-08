'use client';

import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Advanced Hook to track post views, attention (dwell time), scroll depth, and interactions.
 * Centralizes logic from community feed and marketplace discovery.
 * 
 * @param {string} postId - The UUID of the post/product/request
 * @param {string} type - 'product' | 'request' | 'post' | 'blog' | etc
 * @param {function} onEvent - Optional callback for all tracking events (for feed ranking etc)
 */
export function usePostTracking(postId, type = 'post', onEvent = null) {
  const elementRef = useRef(null);
  const stateRef = useRef({
    maxVisibleRatio: 0,
    visibleStartTime: null,
    cumulativeTime: 0,
    attentionSent: false,
    skipSent: false,
    scrollDepthSent: false,
  });

  const trackInteraction = useCallback(async (interactionType, metadata = {}) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const payload = {
        user_id: user?.id || null,
        post_id: postId,
        event_type: interactionType,
        metadata: metadata,
      };

      // Call external handler if provided (e.g. for batching in useFeed)
      if (onEvent) {
        onEvent(payload);
      }

      // Also log to dedicated interactions table for analytics
      await supabase
        .from('user_interactions')
        .insert([{
          ...payload,
          target_id: postId, // consistency
          target_type: type,
          created_at: new Date().toISOString()
        }]);

      // Increment counters via RPC
      if (interactionType === 'click') {
        const table = type === 'post' || type === 'blog' ? 'content_posts' : 
                      type === 'product' ? 'products' : 'requests';
        
        await supabase.rpc('increment_click_count', { 
          target_table: table, 
          target_id: postId 
        });
      }
    } catch (err) {
      console.error('[usePostTracking] Error tracking interaction:', err);
    }
  }, [postId, type, onEvent]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !postId) return;

    const state = stateRef.current;
    let throttleTimer = null;

    const sendScrollDepth = () => {
      if (state.maxVisibleRatio > 0) {
        trackInteraction('scroll_depth', { max_visible_percent: Math.round(state.maxVisibleRatio * 100) });
        state.maxVisibleRatio = 0; // Reset after sending to allow subsequent updates if needed
      }
    };

    const throttledSend = () => {
      if (throttleTimer) return;
      throttleTimer = setTimeout(() => {
        sendScrollDepth();
        throttleTimer = null;
      }, 1500);
    };

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      const ratio = entry.intersectionRatio;

      if (ratio > state.maxVisibleRatio) {
        state.maxVisibleRatio = ratio;
        throttledSend();
      }

      if (entry.isIntersecting) {
        if (state.visibleStartTime === null) {
          state.visibleStartTime = performance.now();
        }
      } else {
        if (state.visibleStartTime !== null) {
          const visibleMs = performance.now() - state.visibleStartTime;
          state.cumulativeTime += visibleMs;
          state.visibleStartTime = null;

          sendScrollDepth();

          // Fast skip detection (< 1000ms total viewed)
          if (!state.skipSent && state.cumulativeTime < 1000 && state.cumulativeTime > 50) {
            trackInteraction('fast_skip', { total_visible_ms: Math.round(state.cumulativeTime) });
            state.skipSent = true;
          }

          // Attention detection (>= 4000ms cumulative)
          if (!state.attentionSent && state.cumulativeTime >= 4000) {
            trackInteraction('attention', { total_visible_ms: Math.round(state.cumulativeTime) });
            state.attentionSent = true;
          }
        }
      }
    }, { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] });

    observer.observe(element);
    
    return () => {
      if (throttleTimer) clearTimeout(throttleTimer);
      observer.disconnect();
      
      // Final sync on unmount
      if (state.visibleStartTime !== null) {
        const finalMs = performance.now() - state.visibleStartTime;
        state.cumulativeTime += finalMs;
      }
      sendScrollDepth();
    };
  }, [postId, trackInteraction]);

  return { elementRef, trackInteraction };
}
