// hooks/use-debounced-callback.js
import { useCallback, useRef } from 'react';

export function useDebouncedCallback(callback, delay) {
  const timeoutRef = useRef();
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback((...args) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => callbackRef.current(...args), delay);
  }, [delay]);
}