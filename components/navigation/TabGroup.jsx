'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const springTransition = {
  type: 'spring',
  stiffness: 350,
  damping: 28,
};

export function TabGroup({
  tabs = [],
  defaultTab,
  onChange,
  variant = 'default', // 'default' | 'pills' | 'underline'
  className = '',
}) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.value);

  const handleChange = (value) => {
    setActiveTab(value);
    onChange?.(value);
  };

  return (
    <div className={className}>
      <div
        className={`
          flex gap-1
          ${variant === 'pills' ? 'p-1 bg-gray-100 dark:bg-gray-800 rounded-xl' : ''}
          ${variant === 'underline' ? 'border-b border-gray-200 dark:border-gray-700' : ''}
        `}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;

          return (
            <button
              key={tab.value}
              onClick={() => handleChange(tab.value)}
              className={`
                relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                transition-colors duration-200
                ${variant === 'pills'
                  ? isActive
                    ? 'bg-white dark:bg-gray-700 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                  : ''
                }
              `}
            >
              <span className={isActive ? 'text-foreground' : 'text-muted-foreground'}>
                {tab.icon && <tab.icon className="w-4 h-4" />}
                {tab.label}
              </span>
              {tab.count !== undefined && (
                <span
                  className={`
                    text-xs px-1.5 py-0.5 rounded-full
                    ${isActive
                      ? 'bg-primary/10 text-primary'
                      : 'bg-gray-100 dark:bg-gray-700 text-muted-foreground'
                    }
                  `}
                >
                  {tab.count}
                </span>
              )}

              {variant === 'underline' && isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  transition={springTransition}
                />
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {tabs.find((t) => t.value === activeTab)?.content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/**
 * Vertical tab group for sidebars
 */
export function VerticalTabs({
  tabs = [],
  defaultTab,
  onChange,
  className = '',
}) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.value);

  return (
    <div className={`flex gap-4 ${className}`}>
      <div className="w-48 shrink-0 space-y-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;

          return (
            <button
              key={tab.value}
              onClick={() => {
                setActiveTab(tab.value);
                onChange?.(tab.value);
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left
                transition-all duration-200
                ${isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-foreground'
                }
              `}
            >
              {tab.icon && <tab.icon className="w-5 h-5" />}
              <div className="flex-1 min-w-0">
                <span className="block truncate">{tab.label}</span>
                {tab.description && (
                  <span className="block text-xs opacity-70 truncate">
                    {tab.description}
                  </span>
                )}
              </div>
              {tab.badge && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex-1 min-w-0">
        {tabs.find((t) => t.value === activeTab)?.content}
      </div>
    </div>
  );
}
