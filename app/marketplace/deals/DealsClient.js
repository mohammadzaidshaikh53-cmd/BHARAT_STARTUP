'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchProducts } from '@/lib/supabase/marketplace';
import { getFeedProducts } from '@/lib/marketplace/discovery';
import MarketplaceFeedLayout from '@/components/marketplace/MarketplaceFeedLayout';

const PAGE_SIZE = 20;

export default function DealsClient() {
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const { products } = await fetchProducts({
                    feedType: 'deals',
                    searchTerm,
                    page: 0,
                    pageSize: 1000,
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

    const deals = useMemo(() => getFeedProducts(allProducts, 'deals', ''), [allProducts]);

    const displayed = useMemo(
        () => deals.slice(0, (page + 1) * PAGE_SIZE),
        [deals, page]
    );

    const hasMore = displayed.length < deals.length;

    const handleSearch = useCallback((term) => {
        setSearchTerm(term);
        setPage(0);
    }, []);

    return (
        <MarketplaceFeedLayout
            title="Deals"
            subtitle="Best discounts available"
            stats={[{ label: 'Active Deals', value: deals.length }]}
            feedType="deals"
            products={displayed}
            allProducts={deals}
            searchTerm={searchTerm}
            onSearch={handleSearch}
            loading={loading}
            error={error}
            hasMore={hasMore}
            onLoadMore={() => setPage(p => p + 1)}
            emptyProps={{
                title: 'No deals right now',
                message: 'Check back soon for offers.',
            }}
        />
    );
}