// components/common/Button.js
'use client';

import { motion } from 'framer-motion';
import { defaultHover, defaultTap } from '@/components/motion/variants';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const variantStyles = {
  primary: 'bg-accent-primary text-bg-base hover:bg-accent-primary-hover focus:ring-accent-primary',
  secondary: 'bg-transparent border border-white/20 text-text-primary hover:bg-white/5 focus:ring-white/30',
  destructive: 'bg-status-error text-white hover:bg-red-700 focus:ring-red-500',
  ghost: 'bg-transparent text-text-primary hover:bg-white/10 focus:ring-white/20',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-4 py-2 text-base rounded-lg',
  lg: 'px-6 py-3 text-lg rounded-xl',
};

export const Button = ({
  children,
  onClick,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  type = 'button',
  ariaLabel,
  fullWidth = false,
}) => {
  // Fix: keep keys, not values
  const safeVariant = variantStyles[variant] ? variant : 'primary';
  const safeSize = sizeStyles[size] ? size : 'md';

  // Fix: interactive only depends on disabled/loading, not onClick
  const isInteractive = !disabled && !loading;
  const hasOnClick = typeof onClick === 'function';

  return (
    <motion.button
      type={type}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading || undefined}
      aria-disabled={disabled || loading || undefined}
      whileHover={isInteractive ? defaultHover : undefined}
      whileTap={isInteractive ? defaultTap : undefined}
      onClick={isInteractive && hasOnClick ? onClick : undefined}
      className={cn(
        'relative inline-flex items-center justify-center font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-base disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[safeVariant],
        sizeStyles[safeSize],
        fullWidth && 'w-full',
        className
      )}
    >
      {loading && (
        <>
          <span className="sr-only">Loading</span>
          <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Spinner className="w-4 h-4" aria-hidden="true" />
          </span>
        </>
      )}
      <span className={cn('inline-flex items-center', loading && 'opacity-0')}>
        {children}
      </span>
    </motion.button>
  );
};

function Spinner({ className, ...props }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}