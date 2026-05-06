// lib/hooks/useDelayedFallback.js
import { useEffect, useState, useRef } from 'react';

export function useDelayedFallback(delayMs = 300) {
  const [show, setShow] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShow(false);
    timerRef.current = setTimeout(() => setShow(true), delayMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [delayMs]);

  return show;
}