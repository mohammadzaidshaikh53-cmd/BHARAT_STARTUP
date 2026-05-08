'use client';

import { motion } from 'framer-motion';
import { forwardRef } from 'react';

const springTransition = {
  type: 'spring',
  stiffness: 350,
  damping: 28,
};

export const FormField = forwardRef(function FormField(
  {
    label,
    error,
    hint,
    required = false,
    children,
    className = '',
  },
  ref
) {
  return (
    <div ref={ref} className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      {children}

      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="text-xs text-red-500"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
});

/**
 * Input wrapper with animation
 */
export function Input({
  error,
  className = '',
  ...props
}) {
  return (
    <div className="relative">
      <input
        className={`
          w-full px-4 py-2.5 rounded-xl
          bg-white dark:bg-gray-900
          border border-gray-200 dark:border-gray-700
          text-foreground placeholder:text-muted-foreground
          focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:ring-red-500/20' : ''}
          ${className}
        `}
        {...props}
      />
    </div>
  );
}

/**
 * Textarea with auto-resize
 */
export function Textarea({
  error,
  className = '',
  rows = 3,
  ...props
}) {
  return (
    <textarea
      rows={rows}
      className={`
        w-full px-4 py-3 rounded-xl resize-none
        bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-700
        text-foreground placeholder:text-muted-foreground
        focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${error ? 'border-red-500 focus:ring-red-500/20' : ''}
        ${className}
      `}
      {...props}
    />
  );
}

/**
 * Floating label input
 */
export function FloatingInput({
  label,
  error,
  className = '',
  ...props
}) {
  return (
    <div className="relative">
      <input
        {...props}
        placeholder=" "
        className={`
          peer w-full px-4 py-3 pt-6 rounded-xl
          bg-white dark:bg-gray-900
          border border-gray-200 dark:border-gray-700
          text-foreground
          focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
          transition-all duration-200
          ${error ? 'border-red-500 focus:ring-red-500/20' : ''}
          ${className}
        `}
      />
      <label
        className={`
          absolute left-4 top-3 text-sm text-muted-foreground
          transition-all duration-200 pointer-events-none
          peer-placeholder-shown:top-3 peer-placeholder-shown:text-base
          peer-focus:top-1.5 peer-focus:text-xs
          peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-xs
          peer-focus:text-primary
        `}
      >
        {label}
        {props.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    </div>
  );
}
