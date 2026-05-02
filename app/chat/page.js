'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

import { ChatList } from '@/components/chat/ChatList';
import { ChatRoom } from '@/components/chat/ChatRoom';
import { GroupInfoPanel } from '@/components/panels/GroupInfoPanel';
import { fadeSlide, slideFromRight } from '@/components/motion/variants';

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
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [stableRoomId, setStableRoomId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const panelRef = useRef(null);
  const startTrapRef = useRef(null);
  const endTrapRef = useRef(null);

  // ========== Auth ==========
  useEffect(() => {
    let mounted = true;
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!mounted) return;
      if (error) {
        console.error('Auth error:', error);
      } else {
        setCurrentUserId(data.user?.id);
      }
      setLoadingUser(false);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setCurrentUserId(session?.user?.id ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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
      // Ignore right‑click and non‑primary buttons
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
      // Focus first interactive element; fallback to panel itself
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
        Please log in to view chats.
      </div>
    );
  }

  // Future: wrap ChatRoom in <Suspense fallback={<SkeletonLoader />}>
  return (
    <div className="flex h-screen bg-bg-base text-text-primary overflow-hidden">
      {/* LEFT SIDEBAR */}
      <div className="w-[320px] md:w-80 flex-shrink-0 border-r border-white/10 bg-bg-raised/30 backdrop-blur-sm">
        <ChatList onSelectRoom={setSelectedRoomId} selectedRoomId={selectedRoomId} />
      </div>

      {/* CENTER CHAT AREA */}
      <div className="flex-1 relative flex flex-col">
        <AnimatePresence mode="wait">
          {stableRoomId ? (
            <motion.div
              key={stableRoomId}
              variants={fadeSlide}
              initial="hidden"
              animate="visible"
              exit="exit"
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
            variants={slideFromRight(PANEL_WIDTH)}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', stiffness: 260, damping: 25 }}
            style={{ width: PANEL_WIDTH }}
            className="flex-shrink-0 focus:outline-none"
          >
            {/* Focus trap start */}
            <div tabIndex={0} ref={startTrapRef} className="sr-only" />
            <GroupInfoPanel roomId={stableRoomId} onClose={closeInfoPanel} />
            {/* Focus trap end */}
            <div tabIndex={0} ref={endTrapRef} className="sr-only" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}