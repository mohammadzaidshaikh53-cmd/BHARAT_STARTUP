'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSaved } from '@/context/SavedContext';
import { fetchProductsByIds } from '@/lib/supabase/marketplace';
import MarketplaceFeedLayout from '@/components/marketplace/MarketplaceFeedLayout';

const PAGE_SIZE = 20;

export default function SavedClient() {
    const { savedIds } = useSaved();
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch full product objects for saved IDs
    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            if (!savedIds.length) {
                setProducts([]);
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const data = await fetchProductsByIds(savedIds);
                if (!cancelled) setProducts(data);
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => { cancelled = true; };
    }, [savedIds]);

    // Client‑side search filtering
    const filtered = useMemo(() => {
        if (!searchTerm.trim()) return products;
        const q = searchTerm.toLowerCase();
        return products.filter(
            p =>
                p.name.toLowerCase().includes(q) ||
                p.description?.toLowerCase().includes(q) ||
                p.category.toLowerCase().includes(q)
        );
    }, [products, searchTerm]);

    const displayed = useMemo(
        () => filtered.slice(0, (page + 1) * PAGE_SIZE),
        [filtered, page]
    );

    const hasMore = displayed.length < filtered.length;

    const handleSearch = useCallback((term) => {
        setSearchTerm(term);
        setPage(0);
    }, []);

    return (
        <MarketplaceFeedLayout
            title="Saved Products"
            subtitle="Your wishlist"
            stats={[{ label: 'Saved', value: filtered.length }]}
            feedType="saved"
            products={displayed}
            allProducts={filtered}
            searchTerm={searchTerm}
            onSearch={handleSearch}
            loading={loading}
            error={error}
            hasMore={hasMore}
            onLoadMore={() => setPage(p => p + 1)}
            emptyProps={{
                title: 'No saved products',
                message: 'Tap the heart on any product to save it.',
            }}
        />
    );
}