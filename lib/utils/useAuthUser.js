'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export function useAuthUser({ redirectTo = null } = {}) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const init = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (!mountedRef.current) return;

        if (!session?.user) {
          if (redirectTo) {
            router.replace(`/login?redirect=${encodeURIComponent(redirectTo)}`);
          }
          setUser(null);
        } else {
          setUser(session.user);
        }
      } catch (err) {
        console.error('Auth init error:', err);
        setUser(null);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mountedRef.current) return;
      setUser(session?.user || null);
    });

    return () => {
      mountedRef.current = false;
      listener?.subscription?.unsubscribe();
    };
  }, [redirectTo, router]);

  const requireAuth = useCallback(() => {
    if (!user && !loading) {
      if (redirectTo) {
        router.replace(`/login?redirect=${encodeURIComponent(redirectTo)}`);
      }
      return false;
    }
    return user;
  }, [user, loading, redirectTo, router]);

  return { user, loading, requireAuth };
}