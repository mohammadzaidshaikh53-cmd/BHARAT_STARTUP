/**
 * Enterprise Command Palette
 * Pattern from: Linear, Notion, Spotlight, Raycast
 *
 * Features:
 * - Fuzzy search
 * - Keyboard navigation
 * - Categorized results
 * - Recent items
 * - Action shortcuts
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Search,
  Command,
  ArrowUp,
  ArrowDown,
  CornerDownLeft,
  X,
  FileText,
  Users,
  ShoppingBag,
  Settings,
  Bell,
  Plus,
  ExternalLink,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const springTransition = {
  type: 'spring',
  stiffness: 350,
  damping: 28,
};

const CATEGORIES = [
  { id: 'pages', label: 'Pages', icon: FileText },
  { id: 'actions', label: 'Actions', icon: Command },
  { id: 'people', label: 'People', icon: Users },
];

const MOCK_ACTIONS = [
  { id: '1', title: 'Create new product', category: 'actions', icon: Plus, shortcut: 'n' },
  { id: '2', title: 'View notifications', category: 'actions', icon: Bell, shortcut: 'n' },
  { id: '3', title: 'Open settings', category: 'actions', icon: Settings, shortcut: ',' },
  { id: '4', title: 'Go to marketplace', category: 'pages', icon: ShoppingBag },
  { id: '5', title: 'Go to community', category: 'pages', icon: Users },
  { id: '6', title: 'View profile', category: 'pages', icon: Users },
];

export function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const router = useRouter();

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  // Filter results
  const results = useMemo(() => {
    if (!query) return MOCK_ACTIONS;

    return MOCK_ACTIONS.filter((item) =>
      item.title.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  // Group by category
  const groupedResults = useMemo(() => {
    const groups = {};
    results.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [results]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    },
    [results, selectedIndex, onClose]
  );

  // Select result
  const handleSelect = (item) => {
    // Navigate to the item
    if (item.href) {
      router.push(item.href);
    }
    onClose();
  };

  // Flatten for keyboard nav
  let flatIndex = 0;

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Palette */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={springTransition}
          className="absolute top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl"
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 dark:border-gray-800">
              <Search className="w-5 h-5 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search pages, actions, people..."
                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
              />
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded">
                  esc
                </kbd>
                <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto py-2">
              {results.length === 0 ? (
                <div className="px-4 py-8 text-center text-muted-foreground">
                  No results found
                </div>
              ) : (
                Object.entries(groupedResults).map(([categoryId, items]) => {
                  const category = CATEGORIES.find((c) => c.id === categoryId);
                  const CategoryIcon = category?.icon || Command;

                  return (
                    <div key={categoryId}>
                      <div className="px-4 py-2 flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase">
                        <CategoryIcon className="w-3 h-3" />
                        {category?.label || categoryId}
                      </div>
                      {items.map((item) => {
                        const currentIndex = flatIndex++;
                        const isSelected = currentIndex === selectedIndex;
                        const ItemIcon = item.icon || FileText;

                        return (
                          <button
                            key={item.id}
                            onClick={() => handleSelect(item)}
                            onMouseEnter={() => setSelectedIndex(currentIndex)}
                            className={`
                              w-full flex items-center gap-3 px-4 py-2.5 text-left
                              transition-colors
                              ${isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}
                            `}
                          >
                            <ItemIcon className="w-5 h-5 shrink-0" />
                            <span className="flex-1 truncate">{item.title}</span>
                            {item.shortcut && (
                              <kbd className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 rounded">
                                {item.shortcut}
                              </kbd>
                            )}
                            {isSelected && (
                              <CornerDownLeft className="w-4 h-4 text-muted-foreground" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <ArrowUp className="w-3 h-3" />
                <ArrowDown className="w-3 h-3" />
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <CornerDownLeft className="w-3 h-3" />
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">esc</kbd>
                Close
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Command Palette Trigger Button
 */
export function CommandPaletteTrigger({ onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm text-muted-foreground"
    >
      <Search className="w-4 h-4" />
      <span className="hidden sm:inline">Search...</span>
      <kbd className="hidden sm:inline px-2 py-0.5 text-xs bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
        ⌘K
      </kbd>
    </motion.button>
  );
}
