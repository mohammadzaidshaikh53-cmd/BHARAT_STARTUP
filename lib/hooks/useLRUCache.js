import { useRef, useCallback } from 'react';

export function useLRUCache(maxSize = 500, ttlMs = 5 * 60 * 1000) {
  const cache = useRef(new Map());
  const timers = useRef(new Map());

  const set = useCallback((key, value) => {
    if (cache.current.has(key)) {
      cache.current.delete(key);
      if (timers.current.has(key)) clearTimeout(timers.current.get(key));
    }
    cache.current.set(key, value);
    const timer = setTimeout(() => {
      cache.current.delete(key);
      timers.current.delete(key);
    }, ttlMs);
    timers.current.set(key, timer);

    if (cache.current.size > maxSize) {
      const oldestKey = cache.current.keys().next().value;
      cache.current.delete(oldestKey);
      if (timers.current.has(oldestKey)) {
        clearTimeout(timers.current.get(oldestKey));
        timers.current.delete(oldestKey);
      }
    }
  }, [maxSize, ttlMs]);

  const get = useCallback((key) => {
    if (!cache.current.has(key)) return undefined;
    const value = cache.current.get(key);
    // refresh TTL on access
    if (timers.current.has(key)) {
      clearTimeout(timers.current.get(key));
      const timer = setTimeout(() => {
        cache.current.delete(key);
        timers.current.delete(key);
      }, ttlMs);
      timers.current.set(key, timer);
    }
    return value;
  }, [ttlMs]);

  const clear = useCallback(() => {
    for (const timer of timers.current.values()) clearTimeout(timer);
    cache.current.clear();
    timers.current.clear();
  }, []);

  return { set, get, clear };
}