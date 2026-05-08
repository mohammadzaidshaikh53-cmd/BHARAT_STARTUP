'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchProducts } from '@/lib/supabase/marketplace';
import { getFeedProducts } from '@/lib/marketplace/discovery';
import MarketplaceFeedLayout from '@/components/marketplace/MarketplaceFeedLayout';

const PAGE_SIZE = 20;

export default function NewArrivalsClient() {
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all new‑arrivals products (server could paginate, but client‑side pagination suits this demo)
    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const { products } = await fetchProducts({
                    feedType: 'new-arrivals',
                    searchTerm,
                    page: 0,
                    pageSize: 1000, // Fetch enough for client‑side pagination
                });
                if (!cancelled) setAllProducts(products);
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => { cancelled = true; };
    }, [searchTerm]);

    const sorted = useMemo(() => getFeedProducts(allProducts, 'new-arrivals', ''), [allProducts]);

    const displayed = useMemo(
        () => sorted.slice(0, (page + 1) * PAGE_SIZE),
        [sorted, page]
    );

    const hasMore = displayed.length < sorted.length;

    const handleSearch = useCallback((term) => {
        setSearchTerm(term);
        setPage(0);
    }, []);

    const newTodayCount = useMemo(
        () =>
            allProducts.filter(p => {
                const hours = (Date.now() - new Date(p.created_at).getTime()) / 3600000;
                return hours < 24;
            }).length,
        [allProducts]
    );

    return (
        <MarketplaceFeedLayout
            title="New Arrivals"
            subtitle="Fresh products added recently"
            stats={[{ label: 'New Today', value: newTodayCount }]}
            feedType="new-arrivals"
            products={displayed}
            allProducts={sorted}
            searchTerm={searchTerm}
            onSearch={handleSearch}
            loading={loading}
            error={error}
            hasMore={hasMore}
            onLoadMore={() => setPage(p => p + 1)}
            emptyProps={{
                title: 'No new products',
                message: 'Waiting for sellers to list...',
            }}
        />
    );
}