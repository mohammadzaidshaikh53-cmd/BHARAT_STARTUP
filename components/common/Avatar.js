'use client';

import { useState, useEffect, useMemo, memo } from 'react';

// Simple safe class merge
const cn = (...classes) => classes.filter(Boolean).join(' ');

// Size ratios
const DOT_SIZE_RATIO = 0.25;
const FONT_SIZE_RATIO = 0.4;

// Named sizes for compatibility with your app
const SIZE_MAP = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 56,
};

// Gradient palette
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
  const input = String(str || '');
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const getGradient = (name) => GRADIENTS[hashString(name) % GRADIENTS.length];

const getInitials = (name) => {
  if (!name) return '?';
  const trimmed = String(name).trim();
  if (!trimmed) return '?';
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
};

const resolveSize = (size) => {
  if (typeof size === 'number' && Number.isFinite(size) && size > 0) {
    return size;
  }

  if (typeof size === 'string') {
    if (SIZE_MAP[size]) return SIZE_MAP[size];
    const parsed = Number(size);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }

  return 40;
};

export const Avatar = memo(function Avatar({
  src,
  name = '',
  alt = '',
  fallback = '',
  size = 40,
  online = false,
  className = '',
  onClick,
}) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    setImgError(false);
    setImgLoaded(false);
  }, [src]);

  const displayName = name || alt || '';
  const resolvedSize = useMemo(() => resolveSize(size), [size]);
  const initials = useMemo(() => fallback || getInitials(displayName), [fallback, displayName]);
  const gradientClass = useMemo(() => getGradient(displayName), [displayName]);

  const isInteractive = !!onClick;
  const dotSize = Math.max(resolvedSize * DOT_SIZE_RATIO, 6);
  const fontSize = Math.max(resolvedSize * FONT_SIZE_RATIO, 12);

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
        'relative inline-block flex-shrink-0 overflow-hidden rounded-full',
        isInteractive && 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-bg-base',
        className
      )}
      style={{ width: resolvedSize, height: resolvedSize }}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={`${displayName || 'User'}${online ? ', online' : ''}`}
    >
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

        <div
          className={cn(
            'absolute inset-0 w-full h-full rounded-full bg-gradient-to-br text-white flex items-center justify-center font-semibold transition-opacity duration-300',
            gradientClass,
            imgLoaded && src && !imgError ? 'opacity-0' : 'opacity-100'
          )}
          style={{ fontSize }}
        >
          <div className="absolute inset-0 rounded-full bg-black/30" />
          <span className="relative z-10">{initials}</span>
        </div>
      </div>

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