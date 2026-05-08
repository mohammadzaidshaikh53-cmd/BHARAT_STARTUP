/**
 * Physics-based Animation Hooks
 * Pattern from: Linear, Figma, Apple
 *
 * Provides:
 * - Spring animations with configurable physics
 * - Gesture-based interactions
 * - Motion utilities
 */

'use client';

import { useRef, useCallback } from 'react';
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';

/**
 * Spring configuration presets
 * Based on real-world physics (Apple, Material Design)
 */
export const SPRING_PRESETS = {
  // Default - balanced for most UI
  default: { stiffness: 350, damping: 28, mass: 1 },

  // Precise - for small interactions (checkboxes, toggles)
  precise: { stiffness: 500, damping: 35, mass: 0.8 },

  // Gentle - for large elements (modals, drawers)
  gentle: { stiffness: 200, damping: 30, mass: 1.2 },

  // Bouncy - for playful interactions (celebrations, confetti)
  bouncy: { stiffness: 400, damping: 15, mass: 0.9 },

  // Snappy - for quick feedback (swipe actions)
  snappy: { stiffness: 600, damping: 32, mass: 0.7 },

  // Heavy - for large elements (page transitions)
  heavy: { stiffness: 150, damping: 25, mass: 1.5 },
};

/**
 * Spring hook with preset support
 */
export function useSpringAnimation(preset = 'default') {
  const config = SPRING_PRESETS[preset] || SPRING_PRESETS.default;

  return {
    type: 'spring',
    ...config,
  };
}

/**
 * Damped oscillation hook (for elastic effects)
 */
export function useDampedOscillation(
  initialValue = 0,
  { stiffness = 0.1, damping = 0.8 } = {}
) {
  const value = useMotionValue(initialValue);
  const velocity = useRef(0);

  const setValue = useCallback((newValue: number) => {
    velocity.current = (newValue - value.get()) * stiffness;
    value.set(newValue);
  }, [stiffness]);

  // Apply damping on each frame
  const tick = useCallback(() => {
    velocity.current *= damping;
    if (Math.abs(velocity.current) > 0.001) {
      value.set(value.get() + velocity.current);
    }
  }, [damping]);

  return { value, setValue, tick };
}

/**
 * Scroll-linked animation values
 */
export function useScrollAnimation(target, offset = ['start end', 'end start']) {
  const { scrollYProgress } = useScroll({
    target,
    offset: offset,
  });

  return scrollYProgress;
}

/**
 * Parallax hook
 */
export function useParallax(speed = 50) {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, speed]);

  return y;
}

/**
 * Magnetic hover effect (elements that follow cursor slightly)
 */
export function useMagnetic(ref, { strength = 0.3, range = 100 } = {}) {
  const x = useSpring(0, { stiffness: 150, damping: 15 });
  const y = useSpring(0, { stiffness: 150, damping: 15 });

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

    if (distance < range) {
      const factor = (1 - distance / range) * strength;
      x.set(distanceX * factor);
      y.set(distanceY * factor);
    } else {
      x.set(0);
      y.set(0);
    }
  }, [ref, strength, range]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return { x, y, handleMouseMove, handleMouseLeave };
}

/**
 * Drag with physics constraints
 */
export function useDragWithPhysics({ bounds, spring = 'snappy' }) {
  const springConfig = SPRING_PRESETS[spring] || SPRING_PRESETS.snappy;

  return {
    drag: true,
    dragConstraints: bounds,
    dragElastic: 0.1,
    dragTransition: {
      type: 'spring',
      ...springConfig,
    },
  };
}

/**
 * Tap pulse animation
 */
export function useTapPulse() {
  const scale = useSpring(1, { stiffness: 400, damping: 25 });

  return {
    scale,
    onTap: () => {
      scale.set(0.95);
      setTimeout(() => scale.set(1), 100);
    },
  };
}

/**
 * Number animation hook (for counters, progress, etc.)
 */
export function useAnimatedNumber(initial = 0, { spring = 'default' } = {}) {
  const springConfig = SPRING_PRESETS[spring] || SPRING_PRESETS.default;
  const motionValue = useMotionValue(initial);
  const animatedValue = useSpring(motionValue, springConfig);

  return { motionValue, animatedValue };
}

// Re-export from framer-motion
export { useScroll, useTransform, useMotionValue } from 'framer-motion';
