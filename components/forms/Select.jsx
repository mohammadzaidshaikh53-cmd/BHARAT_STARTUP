'use client';

import { motion } from 'framer-motion';
import { useState, useRef, useEffect, forwardRef } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

const springTransition = {
  type: 'spring',
  stiffness: 350,
  damping: 28,
};

export const Select = forwardRef(function Select(
  {
    options = [],
    value,
    onChange,
    placeholder = 'Select an option',
    label,
    error,
    disabled = false,
    searchable = false,
    multiple = false,
    className = '',
  },
  ref
) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = searchable
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  const selectedOption = options.find((opt) =>
    multiple
      ? (value || []).includes(opt.value)
      : opt.value === value
  );

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1.5">
          {label}
        </label>
      )}

      <button
        type="button"
        ref={ref}
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between px-4 py-2.5 rounded-xl
          bg-white dark:bg-gray-900
          border border-gray-200 dark:border-gray-700
          text-left
          focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${open ? 'ring-2 ring-primary/20 border-primary' : ''}
          ${error ? 'border-red-500' : ''}
        `}
      >
        <span className={selectedOption ? 'text-foreground' : 'text-muted-foreground'}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={springTransition}
          className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden"
        >
          {searchable && (
            <div className="p-2 border-b border-gray-100 dark:border-gray-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  autoFocus
                />
              </div>
            </div>
          )}

          <div className="max-h-60 overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-muted-foreground">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = multiple
                  ? (value || []).includes(option.value)
                  : option.value === value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      if (multiple) {
                        const newValue = isSelected
                          ? (value || []).filter((v) => v !== option.value)
                          : [...(value || []), option.value];
                        onChange(newValue);
                      } else {
                        onChange(option.value);
                        setOpen(false);
                      }
                    }}
                    className={`
                      w-full flex items-center justify-between px-4 py-2.5 text-left
                      hover:bg-gray-50 dark:hover:bg-gray-800
                      transition-colors
                      ${isSelected ? 'bg-primary/5 text-primary' : 'text-foreground'}
                    `}
                  >
                    <div>
                      <span className="text-sm">{option.label}</span>
                      {option.description && (
                        <span className="block text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-primary" />}
                  </button>
                );
              })
            )}
          </div>
        </motion.div>
      )}

      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
});

/**
 * Country select with flag icons
 */
export function CountrySelect(props) {
  const countries = [
    { value: 'IN', label: 'India', flag: '🇮🇳' },
    { value: 'US', label: 'United States', flag: '🇺🇸' },
    { value: 'UK', label: 'United Kingdom', flag: '🇬🇧' },
    { value: 'DE', label: 'Germany', flag: '🇩🇪' },
    { value: 'CN', label: 'China', flag: '🇨🇳' },
    { value: 'JP', label: 'Japan', flag: '🇯🇵' },
    { value: 'SG', label: 'Singapore', flag: '🇸🇬' },
    { value: 'AE', label: 'UAE', flag: '🇦🇪' },
    { value: 'AU', label: 'Australia', flag: '🇦🇺' },
  ];

  return (
    <Select
      options={countries}
      searchable
      {...props}
    />
  );
}
