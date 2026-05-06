import { useEffect, useRef } from 'react';

export function useScrollVelocity() {
  const velocityRef = useRef(0);
  const lastScrollY = useRef(0);
  const lastTimestamp = useRef(Date.now());

  useEffect(() => {
    let rafId = null;

    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const now = Date.now();
        const deltaY = Math.abs(window.scrollY - lastScrollY.current);
        const deltaT = now - lastTimestamp.current;
        if (deltaT > 0) {
          const velocity = deltaY / deltaT; // pixels per ms
          velocityRef.current = Math.min(1.5, velocity); // cap at 1.5px/ms
        }
        lastScrollY.current = window.scrollY;
        lastTimestamp.current = now;
        rafId = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return velocityRef.current;
}