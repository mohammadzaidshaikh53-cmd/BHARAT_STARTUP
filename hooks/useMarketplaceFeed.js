'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';

export function useMarketplaceFeed({
    feedType,
    fetchFn,           // async () => { products: [] }
    pageSize = 20,
    deps = [],         // dependencies for re‑fetch
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);

        fetchFn(searchTerm)
            .then(({ products }) => {
                if (!cancelled) setAllProducts(products);
            })
            .catch(err => {
                if (!cancelled) setError(err.message);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [searchTerm, ...deps]); // eslint-disable-line

    const displayed = useMemo(
        () => allProducts.slice(0, (page + 1) * pageSize),
        [allProducts, page, pageSize]
    );

    const hasMore = displayed.length < allProducts.length;

    const handleSearch = useCallback((term) => {
        setSearchTerm(term);
        setPage(0);
    }, []);

    const loadMore = useCallback(() => setPage(p => p + 1), []);

    return {
        allProducts,
        displayed,
        searchTerm,
        loading,
        error,
        hasMore,
        handleSearch,
        loadMore,
    };
}