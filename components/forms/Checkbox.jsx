'use client';

import { motion } from 'framer-motion';
import { forwardRef } from 'react';
import { Check } from 'lucide-react';

const springTransition = {
  type: 'spring',
  stiffness: 350,
  damping: 28,
};

export const Checkbox = forwardRef(function Checkbox(
  {
    checked = false,
    onChange,
    label,
    description,
    disabled = false,
    error,
    className = '',
  },
  ref
) {
  return (
    <label
      className={`
        relative flex items-start gap-3 cursor-pointer
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {/* Hidden native checkbox */}
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only"
      />

      {/* Custom checkbox */}
      <div
        className={`
          w-5 h-5 shrink-0 rounded-md border-2
          flex items-center justify-center
          transition-all duration-200
          ${checked
            ? 'bg-primary border-primary'
            : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600'
          }
          ${error ? 'border-red-500' : ''}
          ${!disabled ? 'group-hover:border-primary/50' : ''}
        `}
      >
        <motion.div
          initial={checked ? { scale: 0 } : { scale: 1 }}
          animate={checked ? { scale: 1 } : { scale: 0 }}
          transition={springTransition}
        >
          <Check className="w-3 h-3 text-white" strokeWidth={3} />
        </motion.div>
      </div>

      {/* Label content */}
      <div className="flex-1 min-w-0">
        {label && (
          <span className="text-sm font-medium text-foreground">{label}</span>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>

      {error && (
        <p className="absolute -bottom-5 left-0 text-xs text-red-500">{error}</p>
      )}
    </label>
  );
});

/**
 * Toggle switch (checkbox variant)
 */
export const Toggle = forwardRef(function Toggle(
  {
    checked = false,
    onChange,
    label,
    disabled = false,
    size = 'default', // 'sm' | 'default'
    className = '',
  },
  ref
) {
  const sizes = {
    sm: { track: 'w-9 h-5', thumb: 'w-4 h-4', translate: 'translate-x-4' },
    default: { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 'translate-x-5' },
  };

  return (
    <label
      className={`
        inline-flex items-center gap-3 cursor-pointer
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only"
      />

      <div
        className={`
          relative rounded-full transition-colors duration-200
          ${sizes[size].track}
          ${checked ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}
        `}
      >
        <motion.div
          initial={false}
          animate={{ x: checked ? 0 : 2 }}
          transition={springTransition}
          className={`
            absolute top-1/2 -translate-y-1/2 rounded-full bg-white shadow-sm
            ${sizes[size].thumb}
            ${checked ? sizes[size].translate : ''}
          `}
        />
      </div>

      {label && (
        <span className="text-sm font-medium text-foreground">{label}</span>
      )}
    </label>
  );
});

/**
 * Radio group
 */
export function RadioGroup({
  options = [],
  value,
  onChange,
  label,
  error,
  className = '',
}) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      )}

      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={`
              flex items-center gap-3 p-3 rounded-xl border cursor-pointer
              transition-all duration-200
              ${value === option.value
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
              }
            `}
          >
            <input
              type="radio"
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />

            <div
              className={`
                w-4 h-4 rounded-full border-2 flex items-center justify-center
                ${value === option.value
                  ? 'border-primary'
                  : 'border-gray-300 dark:border-gray-600'
                }
              `}
            >
              {value === option.value && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={springTransition}
                  className="w-2 h-2 rounded-full bg-primary"
                />
              )}
            </div>

            <div className="flex-1">
              <span className="text-sm font-medium text-foreground">{option.label}</span>
              {option.description && (
                <p className="text-xs text-muted-foreground">{option.description}</p>
              )}
            </div>
          </label>
        ))}
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
