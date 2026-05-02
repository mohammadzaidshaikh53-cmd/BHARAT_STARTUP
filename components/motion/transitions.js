// motion/transitions.js
import { useReducedMotion } from 'framer-motion';

// -----------------------------------------------------------------------------
// 1. TIMING SCALE (centralized, in seconds)
// -----------------------------------------------------------------------------
const TIMING = {
  micro: 0.08,
  small: 0.12,
  medium: 0.2,
  large: 0.3,
};

const EASING = {
  standard: [0.4, 0, 0.2, 1],
  decelerate: [0, 0, 0.2, 1],
  accelerate: [0.4, 0, 1, 1],
  sharp: [0.4, 0, 0.6, 1],
};

// -----------------------------------------------------------------------------
// 2. PRESET DEFINITIONS (mapped to timing scale)
// -----------------------------------------------------------------------------
const PRESETS = {
  // micro-interactions (hover, tap)
  fast: {
    type: 'tween',
    duration: TIMING.micro,
    ease: EASING.standard,
  },
  // UI/content transitions (fade, slide)
  smooth: {
    type: 'tween',
    duration: TIMING.small,
    ease: EASING.standard,
  },
  // standard spring for panels/modals
  spring: {
    type: 'spring',
    stiffness: 350,
    damping: 28,
  },
  // softer spring for large panels
  softSpring: {
    type: 'spring',
    stiffness: 260,
    damping: 25,
  },
  // exit animations (fast fade out)
  exit: {
    type: 'tween',
    duration: TIMING.micro,
    ease: EASING.accelerate,
  },
  // no animation (reduced motion)
  none: { duration: 0 },
};

// -----------------------------------------------------------------------------
// 3. VALIDATION (ensures preset exists, fallback to 'smooth')
// -----------------------------------------------------------------------------
const isValidPreset = (preset) => preset in PRESETS;

const getSafePreset = (preset) => (isValidPreset(preset) ? preset : 'smooth');

// -----------------------------------------------------------------------------
// 4. PURE FUNCTION: getTransition(preset, reduced?)
// -----------------------------------------------------------------------------
export const getTransition = (preset, reduced = false) => {
  const safePreset = getSafePreset(preset);
  if (reduced) return PRESETS.none;
  return PRESETS[safePreset];
};

// -----------------------------------------------------------------------------
// 5. REACT HOOK: useMotionTransition(preset)
//    - Uses useReducedMotion from framer-motion (SSR-safe)
//    - Automatically returns 'none' when reduced motion is preferred
// -----------------------------------------------------------------------------
export const useMotionTransition = (preset) => {
  const prefersReduced = useReducedMotion();
  return getTransition(preset, prefersReduced);
};

// -----------------------------------------------------------------------------
// 6. EXPOSE TIMING AND EASING FOR ADVANCED USE (optional)
// -----------------------------------------------------------------------------
export const transitionConfig = {
  timing: TIMING,
  easing: EASING,
  presets: PRESETS,
};