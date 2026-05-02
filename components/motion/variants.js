// motion/variants.js

// -----------------------------------------------------------------------------
// 1. DIRECTIONAL GENERATORS (pure, support any CSS unit)
// -----------------------------------------------------------------------------
const ALLOWED_X = new Set(['left', 'right']);
const ALLOWED_Y = new Set(['up', 'down']);

export const slideX = (direction = 'left', distance = '100%') => {
  let dir = direction;
  if (typeof window !== 'undefined' && !ALLOWED_X.has(dir)) {
    console.warn(`slideX: invalid direction "${dir}", defaulting to "left"`);
    dir = 'left';
  }
  const x = dir === 'left' ? `-${distance}` : dir === 'right' ? distance : 0;
  return {
    hidden: { x, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x, opacity: 0 },
  };
};

export const slideY = (direction = 'up', distance = '100%') => {
  let dir = direction;
  if (typeof window !== 'undefined' && !ALLOWED_Y.has(dir)) {
    console.warn(`slideY: invalid direction "${dir}", defaulting to "up"`);
    dir = 'up';
  }
  const y = dir === 'up' ? `-${distance}` : dir === 'down' ? distance : 0;
  return {
    hidden: { y, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: { y, opacity: 0 },
  };
};

// -----------------------------------------------------------------------------
// 2. SEMANTIC VARIANTS (pure factory functions – structure only)
//    - All variants accept a `reduced` flag to strip transforms (opacity‑only).
//    - Key parameters (opacity, distance, scale) are exposed, not hardcoded.
//    - Entry and exit states are symmetric by default.
// -----------------------------------------------------------------------------

// Backdrop overlay – configurable opacity (default 0.3), clamped 0–1
export const backdropFade = (reduced = false, opacity = 0.3) => {
  const safeOpacity = Math.min(1, Math.max(0, opacity));
  return {
    hidden: { opacity: 0 },
    visible: { opacity: reduced ? 0 : safeOpacity },
    exit: { opacity: 0 },
  };
};

// Content fade – configurable vertical distance (default 4px)
export const contentFade = (reduced = false, yDistance = 4) => ({
  hidden: { opacity: 0, y: reduced ? 0 : yDistance },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: reduced ? 0 : yDistance },
});

// Side panel slide – configurable direction and distance (default right, 100%)
export const panelSlide = (reduced = false, direction = 'right', distance = '100%') =>
  reduced ? {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  } : slideX(direction, distance);

// Modal scale – configurable start scale (default 0.95), clamped 0.9–1
export const modalScale = (reduced = false, startScale = 0.95) => {
  const safeScale = Math.min(1, Math.max(0.9, startScale));
  return {
    hidden: { opacity: 0, scale: reduced ? 1 : safeScale },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: reduced ? 1 : safeScale },
  };
};

// -----------------------------------------------------------------------------
// 3. LIST ORCHESTRATION (stagger children)
//    - Stagger timings are structural – may be overridden at component level.
//    - When reduced motion is active, stagger is disabled.
// -----------------------------------------------------------------------------
export const listContainer = (reduced = false) => ({
  visible: reduced
    ? {}
    : { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
});

export const listItem = (reduced = false, xDistance = -8) => ({
  hidden: { opacity: 0, x: reduced ? 0 : xDistance },
  visible: { opacity: 1, x: 0 },
});

// -----------------------------------------------------------------------------
// 4. INTERACTION VARIANTS (static objects – scale remains; disable at component level if needed)
// -----------------------------------------------------------------------------
export const hoverScale = (scale = 1.02) => ({ scale });
export const tapScale = (scale = 0.98) => ({ scale });

// For convenience, default interaction objects
export const defaultHover = hoverScale();
export const defaultTap = tapScale();