'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

import { ChatList } from '@/components/chat/ChatList';
import { ChatRoom } from '@/components/chat/ChatRoom';
import { GroupInfoPanel } from '@/components/panels/GroupInfoPanel';
import { panelSlide } from '@/components/motion/variants';

// ========== Skeleton loader ==========
function SkeletonLoader() {
  return (
    <div className="flex items-center justify-center h-screen bg-bg-base text-text-primary">
      <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// ========== No chat selected ==========
function NoChatSelected() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-text-secondary gap-2">
      <p className="text-lg font-medium">No chat selected</p>
      <p className="text-sm opacity-70">Pick a conversation from the left</p>
    </div>
  );
}

const PANEL_WIDTH = 320;

export default function ChatPage() {
  const router = useRouter();
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [stableRoomId, setStableRoomId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const panelRef = useRef(null);
  const startTrapRef = useRef(null);
  const endTrapRef = useRef(null);

  // ========== PART 1: Auth guard — redirect if not logged in ==========
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          router.replace('/login?redirect=/chat');
          return;
        }

        if (!session) {
          router.replace('/login?redirect=/chat');
          return;
        }

        setCurrentUserId(session.user.id);
      } catch (err) {
        console.error('Auth check failed:', err);
        router.replace('/login?redirect=/chat');
      } finally {
        setLoadingUser(false);
      }
    };

    checkUser();
  }, [router]);

  // ========== PART 2: Auth state listener ==========
  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      
      if (!session) {
        router.replace('/login?redirect=/chat');
        return;
      }
      
      setCurrentUserId(session?.user?.id ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  // ========== Debounce room switching ==========
  useEffect(() => {
    const timer = setTimeout(() => setStableRoomId(selectedRoomId), 50);
    return () => clearTimeout(timer);
  }, [selectedRoomId]);

  // ========== Escape key closes panel ==========
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showInfoPanel) setShowInfoPanel(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showInfoPanel]);

  // ========== Click outside (pointerdown with button guard) ==========
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (e.button && e.button !== 0) return;
      if (!showInfoPanel) return;
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowInfoPanel(false);
      }
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, [showInfoPanel]);

  // ========== Focus trap (clean) ==========
  useEffect(() => {
    if (!showInfoPanel) return;

    const handleTab = (e) => {
      if (e.key !== 'Tab') return;
      if (document.activeElement === endTrapRef.current) {
        e.preventDefault();
        startTrapRef.current?.focus();
      } else if (document.activeElement === startTrapRef.current && e.shiftKey) {
        e.preventDefault();
        endTrapRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [showInfoPanel]);

  // ========== Focus management & body scroll ==========
  useEffect(() => {
    if (showInfoPanel && panelRef.current) {
      const firstFocusable = panelRef.current.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (firstFocusable) {
        firstFocusable.focus();
      } else {
        panelRef.current.focus();
      }
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showInfoPanel]);

  // ========== Close panel when room changes ==========
  useEffect(() => {
    setShowInfoPanel(false);
  }, [stableRoomId]);

  const openInfoPanel = useCallback(() => setShowInfoPanel(true), []);
  const closeInfoPanel = useCallback(() => setShowInfoPanel(false), []);

  // ========== Loading / auth guards ==========
  if (loadingUser) return <SkeletonLoader />;
  
  if (!currentUserId) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-base text-text-primary">
        <div className="text-center">
          <p className="mb-2">Please log in to view chats.</p>
          <button 
            onClick={() => router.push('/login?redirect=/chat')}
            className="text-accent-primary hover:underline text-sm"
          >
            Go to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-bg-base text-text-primary overflow-hidden">
      {/* LEFT SIDEBAR */}
      <div className="w-[320px] md:w-80 flex-shrink-0 border-r border-white/10 bg-bg-raised/30 backdrop-blur-sm">
        <ChatList 
          onSelectRoom={setSelectedRoomId} 
          selectedRoomId={selectedRoomId} 
          currentUserId={currentUserId}
        />
      </div>

      {/* CENTER CHAT AREA */}
      <div className="flex-1 relative flex flex-col">
        <AnimatePresence mode="wait">
          {stableRoomId ? (
            <motion.div
              key={stableRoomId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="flex-1 flex flex-col"
            >
              <ChatRoom
                roomId={stableRoomId}
                currentUserId={currentUserId}
                onOpenInfoPanel={openInfoPanel}
              />
            </motion.div>
          ) : (
            <NoChatSelected />
          )}
        </AnimatePresence>
      </div>

      {/* RIGHT INFO PANEL */}
      <AnimatePresence>
        {showInfoPanel && stableRoomId && (
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            initial={{ x: PANEL_WIDTH, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: PANEL_WIDTH, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 25 }}
            style={{ width: PANEL_WIDTH }}
            className="flex-shrink-0 focus:outline-none"
          >
            <div tabIndex={0} ref={startTrapRef} className="sr-only" aria-hidden="true" />
            <GroupInfoPanel 
              roomId={stableRoomId} 
              onClose={closeInfoPanel}
              onRoomRemoved={() => {
                setSelectedRoomId(null);
                setStableRoomId(null);
              }}
              currentUserId={currentUserId}
            />
            <div tabIndex={0} ref={endTrapRef} className="sr-only" aria-hidden="true" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}