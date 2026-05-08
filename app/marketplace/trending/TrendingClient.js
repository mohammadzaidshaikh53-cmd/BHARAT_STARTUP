'use client';
import { useState, useEffect, useCallback } from 'react';
import { fetchProducts } from '@/lib/supabase/marketplace';
import { calculateTrendingScore } from '@/lib/marketplace/ranking';
import MarketplaceFeedLayout from '@/components/marketplace/MarketplaceFeedLayout';

const PAGE_SIZE = 20;

export default function TrendingClient() {
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    const loadPage = useCallback(async (pageNum, reset = false) => {
        setLoading(true);
        setError(null);
        try {
            const { products: newProducts, hasMore: more } = await fetchProducts({
                feedType: 'trending',
                searchTerm,
                page: pageNum,
                pageSize: PAGE_SIZE,
            });

            // Enrich with ranking scores (client-side because server already 
            // returns products ordered by recency, we need to rank them)
            const enriched = newProducts.map((p, idx) => ({
                ...p,
                trendingScore: calculateTrendingScore(p),
                trendingRank: pageNum * PAGE_SIZE + idx + 1,
            }));

            if (reset) {
                setProducts(enriched);
            } else {
                setProducts(prev => [...prev, ...enriched]);
            }
            setHasMore(more);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        setPage(0);
        loadPage(0, true);
    }, [loadPage]);

    const handleLoadMore = () => {
        const next = page + 1;
        setPage(next);
        loadPage(next, false);
    };

    return (
        <MarketplaceFeedLayout
            title="Trending"
            subtitle="What’s hot right now"
            stats={[{ label: 'Trending Products', value: products.length }]}
            feedType="trending"
            products={products}
            allProducts={products}
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            loading={loading}
            error={error}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            emptyProps={{ title: 'No trending products', message: 'Check back later.' }}
        />
    );
}