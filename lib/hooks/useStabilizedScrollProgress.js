// lib/hooks/useStabilizedScrollProgress.js
import { useEffect, useState, useRef, useCallback } from 'react';

export function useStabilizedScrollProgress() {
  const [progress, setProgress] = useState(0);
  const rafId = useRef(null);
  const latestProgress = useRef(0);

  const updateProgress = useCallback(() => {
    const winScroll = document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    const value = height > 0 ? winScroll / height : 0;
    latestProgress.current = value;
    setProgress(value);
    rafId.current = null;
  }, []);

  const handleScroll = useCallback(() => {
    if (rafId.current !== null) return;
    rafId.current = requestAnimationFrame(updateProgress);
  }, [updateProgress]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initial value
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [handleScroll]);

  return progress;
}