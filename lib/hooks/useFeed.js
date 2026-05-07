'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchPersonalizedFeed, trackEngagementBatch } from '@/lib/feed/feedClient';

const PAGE_SIZE = 12;
const PREFETCH_THRESHOLD = 0.7;

export function useFeed(userId, contentType = null) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const cursorRef = useRef({ score: Number.POSITIVE_INFINITY, id: null });
  const isFetchingRef = useRef(false);
  const prefetchCacheRef = useRef(null);
  
  const engagementBufferRef = useRef([]);
  const engagementTimerRef = useRef(null);

  const fetchPage = useCallback(async (isRefresh = false) => {
    if (!userId || isFetchingRef.current) return;
    if (!isRefresh && !hasMore) return;

    isFetchingRef.current = true;
    setLoading(true);

    try {
      const cursor = isRefresh ? { score: Number.POSITIVE_INFINITY, id: null } : cursorRef.current;
      const cursorKey = `${cursor.score}_${cursor.id}_${contentType}`;

      let payload = null;
      if (prefetchCacheRef.current && prefetchCacheRef.current.cursorKey === cursorKey) {
        payload = prefetchCacheRef.current.payload;
        prefetchCacheRef.current = null;
      }

      if (!payload) {
        payload = await fetchPersonalizedFeed({
          userId,
          limit: PAGE_SIZE,
          cursorScore: cursor.score,
          cursorId: cursor.id,
          contentType,
        });
      }

      const { items: fetchedItems, nextCursor } = payload;

      if (!fetchedItems || fetchedItems.length === 0) {
        setHasMore(false);
        return;
      }

      if (nextCursor) {
        cursorRef.current = nextCursor;
      }

      setItems(prev => {
        if (isRefresh) return fetchedItems;
        const existingIds = new Set(prev.map(i => i.item_id));
        return [...prev, ...fetchedItems.filter(i => !existingIds.has(i.item_id))];
      });

      setHasMore(fetchedItems.length === PAGE_SIZE);
    } catch (err) {
      console.error('Canonical Feed Error:', err);
      setError(err);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [userId, hasMore, contentType]);

  const prefetchNextPage = useCallback(async () => {
    if (!userId || !hasMore || isFetchingRef.current || loading) return;

    const nextCursor = cursorRef.current;
    const cursorKey = `${nextCursor.score}_${nextCursor.id}_${contentType}`;
    if (prefetchCacheRef.current && prefetchCacheRef.current.cursorKey === cursorKey) return;

    try {
      const payload = await fetchPersonalizedFeed({
        userId,
        limit: PAGE_SIZE,
        cursorScore: nextCursor.score,
        cursorId: nextCursor.id,
        contentType,
      });

      if (payload.items?.length > 0) {
        prefetchCacheRef.current = { cursorKey, payload };
      }
    } catch (e) {
      console.warn('Prefetch Error:', e.message);
    }
  }, [userId, hasMore, loading, contentType]);

  const refresh = useCallback(() => {
    setItems([]);
    cursorRef.current = { score: Number.POSITIVE_INFINITY, id: null };
    prefetchCacheRef.current = null;
    setHasMore(true);
    setError(null);
    fetchPage(true);
  }, [fetchPage]);

  // Engagement Tracking
  const track = useCallback((event) => {
    if (!userId) return;
    engagementBufferRef.current.push({
      user_id: userId,
      post_id: event.post_id,
      event_type: event.event_type,
      metadata: event.metadata || {},
    });

    if (engagementBufferRef.current.length >= 20) {
      const events = [...engagementBufferRef.current];
      engagementBufferRef.current = [];
      trackEngagementBatch(events);
    } else {
      if (engagementTimerRef.current) clearTimeout(engagementTimerRef.current);
      engagementTimerRef.current = setTimeout(() => {
        const events = [...engagementBufferRef.current];
        engagementBufferRef.current = [];
        trackEngagementBatch(events);
      }, 10000);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) refresh();
  }, [userId, contentType]);

  useEffect(() => {
    return () => {
      if (engagementTimerRef.current) clearTimeout(engagementTimerRef.current);
      if (engagementBufferRef.current.length > 0) {
        trackEngagementBatch([...engagementBufferRef.current]);
      }
    };
  }, []);

  return { items, loading, hasMore, error, fetchPage, refresh, prefetchNextPage, track };
}