// hooks/useLiveQuery.js
import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export function useLiveQuery({ queryKey, queryFn, enabled = true, staleTime = 0 }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const lastFetchRef = useRef(0);
  const isMountedRef = useRef(true);

  const fetchData = useCallback(async (force = false) => {
    if (!enabled) return;

    const now = Date.now();
    if (!force && staleTime > 0 && now - lastFetchRef.current < staleTime) return;

    setIsLoading(true);
    try {
      const result = await queryFn();
      if (isMountedRef.current) {
        setData(result);
        setError(null);
        lastFetchRef.current = now;
      }
    } catch (err) {
      if (isMountedRef.current) setError(err.message);
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [enabled, queryFn, staleTime]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchData();

    // Realtime subscription for chat changes
    const channel = supabase
      .channel('live-query-chats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, () => fetchData(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_participants' }, () => fetchData(true))
      .subscribe();

    window.addEventListener('refetch-chats', () => fetchData(true));

    return () => {
      isMountedRef.current = false;
      supabase.removeChannel(channel);
      window.removeEventListener('refetch-chats', () => fetchData(true));
    };
  }, [fetchData]);

  return { data, isLoading, error, refetch: () => fetchData(true) };
}