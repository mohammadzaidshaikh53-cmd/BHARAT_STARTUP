import { useRef, useCallback } from 'react';

export function useStableFeed() {
  const lockRef = useRef(false);
  const pendingUpdateRef = useRef(null);

  const stabilize = useCallback((updateFn) => {
    if (lockRef.current) {
      pendingUpdateRef.current = updateFn;
      return;
    }
    lockRef.current = true;
    updateFn();
    requestAnimationFrame(() => {
      lockRef.current = false;
      if (pendingUpdateRef.current) {
        const next = pendingUpdateRef.current;
        pendingUpdateRef.current = null;
        stabilize(next);
      }
    });
  }, []);

  return { stabilize };
}