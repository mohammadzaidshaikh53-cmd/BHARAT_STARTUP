// lib/physics/engine.js — Centralized motion system
// Standardized spring configs for enterprise-grade physics

export const springConfig = {
  type: 'spring',
  stiffness: 350,
  damping: 28,
};

export const fastSpring = {
  type: 'spring',
  stiffness: 500,
  damping: 30,
};

export const slowSpring = {
  type: 'spring',
  stiffness: 200,
  damping: 25,
};

export const bounceSpring = {
  type: 'spring',
  stiffness: 400,
  damping: 15,
};

export const gentleSpring = {
  type: 'spring',
  stiffness: 150,
  damping: 35,
};

// Card entrance animation
export const cardEntrance = {
  initial: { opacity: 0, y: 30, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.95 },
};

// List stagger delays
export const staggerDelay = (index, base = 0.05) => index * base;

// Hover presets
export const cardHover = {
  y: -6,
  scale: 1.02,
  transition: springConfig,
};

export const buttonHover = {
  scale: 1.05,
  transition: fastSpring,
};

export const iconHover = {
  scale: 1.15,
  rotate: 5,
  transition: springConfig,
};

// Page transitions
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

// Shared animation variants
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};
