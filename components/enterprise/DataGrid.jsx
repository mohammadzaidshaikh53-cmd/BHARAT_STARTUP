/**
 * Enterprise Data Grid System
 * Pattern from: Stripe Dashboard, Bloomberg, Linear
 *
 * Features:
 * - Virtualized scrolling
 * - Sortable columns
 * - Resizable columns
 * - Row selection
 * - Expandable rows
 * - Sticky headers
 * - Loading states
 * - Empty states
 */

'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, ChevronsUpDown, MoreHorizontal, Check } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';

const springTransition = {
  type: 'spring',
  stiffness: 350,
  damping: 28,
};

export function DataGrid({
  columns = [],
  data = [],
  rowHeight = 52,
  headerHeight = 48,
  selectable = false,
  expandable = false,
  onRowClick,
  onSelectionChange,
  loading = false,
  emptyMessage = 'No data available',
  className = '',
}) {
  const [sortConfig, setSortConfig] = useState(null);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [columnWidths, setColumnWidths] = useState(() =>
    columns.reduce((acc, col) => ({ ...acc, [col.key]: col.width || 150 }), {})
  );

  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: sortedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      const baseHeight = rowHeight;
      if (expandedRows.has(sortedData[index]?.id)) {
        return baseHeight + 200; // Expanded content height
      }
      return baseHeight;
    },
    overscan: 5,
  });

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === bVal) return 0;

      let comparison = 0;
      if (typeof aVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else if (typeof aVal === 'number') {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sortConfig]);

  // Handle sort
  const handleSort = useCallback((key) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        if (prev.direction === 'asc') {
          return { key, direction: 'desc' };
        }
        return null;
      }
      return { key, direction: 'asc' };
    });
  }, []);

  // Handle selection
  const handleSelectAll = useCallback(() => {
    if (selectedRows.size === sortedData.length) {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    } else {
      const allIds = sortedData.map((row) => row.id);
      setSelectedRows(new Set(allIds));
      onSelectionChange?.(allIds);
    }
  }, [sortedData, selectedRows.size, onSelectionChange]);

  const handleSelectRow = useCallback((id) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      onSelectionChange?.(Array.from(newSet));
      return newSet;
    });
  }, [onSelectionChange]);

  // Handle expand
  const handleExpand = useCallback((id) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const SortIcon = ({ column }) => {
    if (sortConfig?.key !== column.key) {
      return <ChevronsUpDown className="w-4 h-4 text-muted-foreground/50" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-primary" />
    ) : (
      <ChevronDown className="w-4 h-4 text-primary" />
    );
  };

  if (loading) {
    return (
      <div className="card-premium overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-100 dark:bg-gray-800" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-[52px] border-t border-gray-100 dark:border-gray-800">
              <div className="h-full px-4 flex gap-4">
                <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-20" />
                <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded flex-1" />
                <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`card-premium overflow-hidden ${className}`}>
      {/* Header */}
      <div
        className="flex items-center h-12 px-4 bg-muted/30 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10"
        style={{ minWidth: Object.values(columnWidths).reduce((a, b) => a + b, 0) }}
      >
        {selectable && (
          <div className="w-10 shrink-0">
            <input
              type="checkbox"
              checked={selectedRows.size === sortedData.length && sortedData.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded border-gray-300"
            />
          </div>
        )}

        {columns.map((column) => (
          <div
            key={column.key}
            onClick={() => column.sortable && handleSort(column.key)}
            className={`
              flex items-center gap-2 px-2
              ${column.sortable ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''}
            `}
            style={{ width: columnWidths[column.key], flexShrink: 0 }}
          >
            <span className="text-sm font-semibold text-muted-foreground truncate">
              {column.label}
            </span>
            {column.sortable && <SortIcon column={column} />}
          </div>
        ))}

        <div className="w-10 shrink-0" />
      </div>

      {/* Body */}
      {sortedData.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        <div ref={parentRef} className="overflow-auto" style={{ maxHeight: '600px' }}>
          <div style={{ height: virtualizer.getTotalSize() }}>
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const row = sortedData[virtualRow.index];
              const isSelected = selectedRows.has(row.id);
              const isExpanded = expandedRows.has(row.id);

              return (
                <motion.div
                  key={row.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: virtualRow.size,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <div
                    className={`
                      flex items-center h-[52px] px-4 border-b border-gray-50 dark:border-gray-800/50
                      ${isSelected ? 'bg-primary/5' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}
                      ${onRowClick ? 'cursor-pointer' : ''}
                    `}
                    onClick={() => onRowClick?.(row)}
                  >
                    {selectable && (
                      <div className="w-10 shrink-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(row.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                      </div>
                    )}

                    {columns.map((column) => (
                      <div
                        key={column.key}
                        className="px-2 truncate"
                        style={{ width: columnWidths[column.key], flexShrink: 0 }}
                      >
                        {column.render ? column.render(row[column.key], row) : (
                          <span className="text-sm">{row[column.key]}</span>
                        )}
                      </div>
                    ))}

                    <div className="w-10 shrink-0 flex justify-end">
                      {expandable && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExpand(row.id);
                          }}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {isExpanded && row.expandedContent && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={springTransition}
                        className="overflow-hidden bg-muted/20"
                      >
                        <div className="p-4">
                          {row.expandedContent}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      {selectedRows.size > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-primary/5 border-t border-primary/20">
          <span className="text-sm font-medium">
            {selectedRows.size} selected
          </span>
          <button
            onClick={() => {
              setSelectedRows(new Set());
              onSelectionChange?.([]);
            }}
            className="text-sm text-primary hover:underline"
          >
            Clear selection
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Enterprise Table - simpler version without virtualization
 */
export function Table({
  columns = [],
  data = [],
  onRowClick,
  className = '',
}) {
  return (
    <div className={`card-premium overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground bg-muted/30"
                  style={{ width: column.width }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={row.id || index}
                onClick={() => onRowClick?.(row)}
                className={`
                  border-b border-gray-50 dark:border-gray-800/50
                  hover:bg-gray-50 dark:hover:bg-gray-800/50
                  ${onRowClick ? 'cursor-pointer' : ''}
                `}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 text-sm">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
