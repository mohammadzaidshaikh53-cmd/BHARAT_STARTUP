'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const springTransition = {
  type: 'spring',
  stiffness: 350,
  damping: 28,
};

export function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  showPageNumbers = true,
  maxVisible = 5,
  className = '',
}) {
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const getVisiblePages = () => {
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    const halfVisible = Math.floor(maxVisible / 2);
    let start = Math.max(currentPage - halfVisible, 1);
    let end = Math.min(currentPage + halfVisible, totalPages);

    if (currentPage <= halfVisible) {
      end = maxVisible;
    }
    if (currentPage > totalPages - halfVisible) {
      start = totalPages - maxVisible + 1;
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const PageButton = ({ page, isActive = false }) => (
    <motion.button
      key={page}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onPageChange(page)}
      className={`
        w-10 h-10 rounded-xl text-sm font-medium
        transition-colors duration-200
        ${isActive
          ? 'bg-primary text-white'
          : 'bg-gray-100 dark:bg-gray-800 text-foreground hover:bg-gray-200 dark:hover:bg-gray-700'
        }
      `}
    >
      {page}
    </motion.button>
  );

  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className={`flex items-center gap-2 ${className}`}>
      {/* Previous */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => canGoPrev && onPageChange(currentPage - 1)}
        disabled={!canGoPrev}
        className={`
          w-10 h-10 rounded-xl flex items-center justify-center
          transition-colors duration-200
          ${canGoPrev
            ? 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
            : 'opacity-50 cursor-not-allowed'
          }
        `}
      >
        <ChevronLeft className="w-5 h-5" />
      </motion.button>

      {/* Page numbers */}
      {showPageNumbers && (
        <div className="flex items-center gap-1">
          {getVisiblePages().map((page, index) => {
            const prevPage = index > 0 ? getVisiblePages()[index - 1] : null;
            const showEllipsis = prevPage && page - prevPage > 1;

            return (
              <div key={page} className="flex items-center gap-1">
                {showEllipsis && (
                  <span className="w-10 h-10 flex items-center justify-center text-muted-foreground">
                    ...
                  </span>
                )}
                <PageButton page={page} isActive={page === currentPage} />
              </div>
            );
          })}
        </div>
      )}

      {/* Next */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => canGoNext && onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        className={`
          w-10 h-10 rounded-xl flex items-center justify-center
          transition-colors duration-200
          ${canGoNext
            ? 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
            : 'opacity-50 cursor-not-allowed'
          }
        `}
      >
        <ChevronRight className="w-5 h-5" />
      </motion.button>

      {/* Page info */}
      <span className="ml-2 text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </span>
    </nav>
  );
}

/**
 * Simple load more button
 */
export function LoadMore({
  hasMore,
  onLoadMore,
  loading = false,
  className = '',
}) {
  if (!hasMore) return null;

  return (
    <div className={`flex justify-center ${className}`}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onLoadMore}
        disabled={loading}
        className={`
          px-6 py-3 rounded-xl font-medium
          bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700
          transition-colors duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {loading ? 'Loading...' : 'Load more'}
      </motion.button>
    </div>
  );
}
