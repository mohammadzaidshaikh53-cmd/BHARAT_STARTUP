'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Debounced search input with clear button and optional loading state.
 *
 * @param {Object} props
 * @param {function} props.onSearch - Called with trimmed search string after debounce.
 * @param {string} [props.placeholder] - Input placeholder.
 * @param {boolean} [props.isLoading] - Shows a spinner when true.
 */
export default function MarketplaceSearch({
    onSearch,
    placeholder = '🔍 Search marketplace...',
    isLoading = false,
}) {
    const [value, setValue] = useState('');
    const timerRef = useRef(null);
    const firstRender = useRef(true);

    const debouncedSearch = useCallback((term) => {
        onSearch(term);
    }, [onSearch]);

    useEffect(() => {
        // Skip calling onSearch on initial mount (let parent fetch default data)
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }

        timerRef.current = setTimeout(() => {
            debouncedSearch(value.trim());
        }, 300);

        return () => clearTimeout(timerRef.current);
    }, [value, debouncedSearch]);

    const handleClear = () => {
        setValue('');
        onSearch('');
    };

    return (
        <div className="relative mb-6">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
            </div>
            <input
                type="search"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                aria-label="Search products"
            />
            {value && (
                <button
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 focus:outline-none"
                    aria-label="Clear search"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
            {isLoading && (
                <div className="absolute right-10 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
}