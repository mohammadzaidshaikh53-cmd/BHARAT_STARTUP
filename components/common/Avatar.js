// components/common/Avatar.js
'use client';

import { useState, useEffect, useMemo, memo } from 'react';

// Simple safe class merge (no dynamic require)
const cn = (...classes) => classes.filter(Boolean).join(' ');

// Size ratios (consistent across the app)
const DOT_SIZE_RATIO = 0.25;
const FONT_SIZE_RATIO = 0.4;

// Gradient palette (deterministic from name)
const GRADIENTS = [
  'from-accent-primary to-accent-secondary',
  'from-cyan-500 to-blue-600',
  'from-violet-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-indigo-500 to-blue-500',
];

// Hash function for consistent gradient selection
const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

// Get gradient class from name
const getGradient = (name) => GRADIENTS[hashString(name) % GRADIENTS.length];

// Extract safe initials (handles spaces, single words, empty)
const getInitials = (name) => {
  if (!name) return '?';
  const trimmed = name.trim();
  if (!trimmed) return '?';
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
};

// Memoised component
export const Avatar = memo(function Avatar({
  src,
  name = '',
  size = 40,
  online = false,
  className = '',
  onClick,
}) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Reset loading/error state when src changes
  useEffect(() => {
    setImgError(false);
    setImgLoaded(false);
  }, [src]);

  const initials = useMemo(() => getInitials(name), [name]);
  const gradientClass = useMemo(() => getGradient(name), [name]);

  const isInteractive = !!onClick;
  const dotSize = size * DOT_SIZE_RATIO;
  const fontSize = size * FONT_SIZE_RATIO;

  // Keyboard handler (Enter + Space)
  const handleKeyDown = (e) => {
    if (!isInteractive) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(e);
    }
  };

  return (
    <div
      className={cn(
        'relative inline-block flex-shrink-0',
        isInteractive && 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-bg-base',
        className
      )}
      style={{ width: size, height: size }}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={`${name || 'User'}${online ? ', online' : ''}`}
    >
      {/* Image + fallback stack */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        {src && !imgError && (
          <img
            src={src}
            alt=""
            className={cn(
              'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
              imgLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            loading="lazy"
            decoding="async"
          />
        )}
        {/* Fallback (initials) – always rendered, but hidden when image loaded */}
        <div
          className={cn(
            'absolute inset-0 w-full h-full rounded-full bg-gradient-to-br text-white flex items-center justify-center font-semibold',
            gradientClass
          )}
          style={{ fontSize }}
        >
          {/* Overlay to guarantee contrast (darkens light backgrounds) */}
          <div className="absolute inset-0 rounded-full bg-black/30" />
          <span className="relative z-10">{initials}</span>
        </div>
      </div>

      {/* Online indicator */}
      {online && (
        <span
          className="absolute bottom-0 right-0 rounded-full bg-status-success ring-2 ring-bg-base"
          style={{ width: dotSize, height: dotSize }}
          aria-hidden="true"
        />
      )}
    </div>
  );
});