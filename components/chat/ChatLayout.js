'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { slideFromRight, fade } from '@/components/motion/variants';

const SIDEBAR_WIDTH = 320;
const PANEL_WIDTH = 384;
const Z_BACKDROP = 10;
const Z_PANEL = 20;

export default function ChatLayout({
  sidebar,
  main,
  panel,
  showPanel = false,
  onClosePanel,
}) {
  const panelRef = useRef(null);
  const previousFocusRef = useRef(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Reactive reduced motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = (e) => setReduceMotion(e.matches);
    setReduceMotion(mq.matches);
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Body scroll lock (centralised – future: use a manager if many overlays)
  useEffect(() => {
    if (showPanel) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showPanel]);

  // Focus management (handles empty panel gracefully)
  useEffect(() => {
    if (showPanel && panelRef.current) {
      previousFocusRef.current = document.activeElement;
      const focusable = panelRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable) focusable.focus();
      else panelRef.current.focus();
    } else if (!showPanel && previousFocusRef.current?.focus) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [showPanel]);

  // Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showPanel) onClosePanel?.();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showPanel, onClosePanel]);

  // Focus trap (safe when no focusable elements)
  useEffect(() => {
    if (!showPanel) return;
    const panel = panelRef.current;
    if (!panel) return;

    const focusableElements = panel.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length === 0) return; // no trap needed

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];

    const handleTab = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };
    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [showPanel]);

  const handleBackdropClick = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    onClosePanel?.();
  };

  const panelTransition = reduceMotion
    ? { duration: 0 }
    : { type: 'spring', stiffness: 260, damping: 25 };
  const backdropTransition = reduceMotion ? { duration: 0 } : { duration: 0.2 };

  // Fixed positioning (global overlay – intentional)
  return (
    <div className="relative flex h-dvh w-full overflow-hidden">
      <aside
        className="flex-shrink-0 border-r border-white/10 bg-bg-raised/30 backdrop-blur-sm overflow-y-auto"
        style={{ width: SIDEBAR_WIDTH }}
      >
        {sidebar}
      </aside>

      <main className="flex-1 relative min-w-0 bg-bg-base overflow-y-auto">
        {main}
      </main>

      <AnimatePresence mode="wait">
        {showPanel && panel && (
          <>
            <motion.div
              key="backdrop"
              variants={fade}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={backdropTransition}
              className="fixed inset-0 bg-black z-[var(--z-backdrop)]"
              style={{ '--z-backdrop': Z_BACKDROP }}
              onClick={handleBackdropClick}
            />
            <motion.aside
              ref={panelRef}
              key="panel"
              variants={slideFromRight(PANEL_WIDTH)}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={panelTransition}
              tabIndex={-1}
              className="fixed right-0 top-0 h-dvh border-l border-white/10 bg-bg-raised shadow-2xl overflow-y-auto focus:outline-none"
              style={{ width: PANEL_WIDTH, zIndex: Z_PANEL }}
              role="dialog"
              aria-modal="true"
              aria-label="Information panel"
            >
              {panel}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}