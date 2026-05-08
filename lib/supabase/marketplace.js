// lib/supabase/marketplace.js

import { supabase } from '@/lib/supabase';

/**
 * IMPORTANT:
 * seller_profiles is NOT directly related to products via FK.
 *
 * products.seller_id -> auth.users.id
 * seller_profiles.user_id -> auth.users.id
 *
 * Therefore seller data must be manually hydrated.
 */

const PRODUCT_SELECT = `
  *,
  product_images(
    id,
    url,
    is_primary,
    sort_order
  ),
  product_stats(
    views,
    clicks,
    inquiries,
    saves
  )
`;

/**
 * Normalize product shape.
 */
function normalizeProduct(product, sellerMap = new Map()) {
    const stats =
        Array.isArray(product.product_stats) &&
            product.product_stats.length > 0
            ? product.product_stats[0]
            : {
                views: 0,
                clicks: 0,
                inquiries: 0,
                saves: 0,
            };

    const primaryImage =
        Array.isArray(product.product_images)
            ? product.product_images.find((img) => img.is_primary) ||
            product.product_images[0]
            : null;

    return {
        ...product,

        /**
         * Manual seller hydration
         */
        seller: sellerMap.get(product.seller_id) || null,

        /**
         * Backward compatibility
         */
        image_url: primaryImage?.url || null,

        product_stats: stats,
    };
}

/**
 * Fetch seller profiles manually.
 */
async function fetchSellerProfiles(userIds = []) {
    if (!userIds.length) {
        return new Map();
    }

    const { data, error } = await supabase
        .from('seller_profiles')
        .select(`
      user_id,
      full_name,
      avatar_url,
      verified,
      company_name,
      whatsapp
    `)
        .in('user_id', userIds);

    if (error) {
        console.error('[fetchSellerProfiles]', error);

        return new Map();
    }

    return new Map(
        (data || []).map((seller) => [
            seller.user_id,
            seller,
        ])
    );
}

/**
 * Fetch marketplace products.
 */
export async function fetchProducts({
    feedType = 'trending',
    searchTerm = '',
    category = null,
    location = null,
    minPrice = null,
    maxPrice = null,
    page = 0,
    pageSize = 20,
    sortBy = null,
    signal = null,
} = {}) {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
        .from('products')
        .select(PRODUCT_SELECT, { count: 'exact' })
        .eq('is_active', true)
        .range(from, to);

    /**
     * SEARCH
     */
    if (searchTerm?.trim()) {
        const term = `%${searchTerm.trim()}%`;

        query = query.or(`
      name.ilike.${term},
      description.ilike.${term},
      category.ilike.${term},
      location.ilike.${term}
    `);
    }

    /**
     * FILTERS
     */
    if (category && category !== 'all') {
        query = query.eq('category', category);
    }

    if (location) {
        query = query.eq('location', location);
    }

    if (minPrice !== null) {
        query = query.gte('price', minPrice);
    }

    if (maxPrice !== null) {
        query = query.lte('price', maxPrice);
    }

    /**
     * FEED FILTERS
     */
    if (feedType === 'deals') {
        query = query.gt('discount_percent', 0);
    }

    /**
     * SORTING
     */
    switch (feedType) {
        case 'new-arrivals':
            query = query.order('created_at', {
                ascending: false,
            });
            break;

        case 'deals':
            query = query.order('discount_percent', {
                ascending: false,
            });
            break;

        case 'trending':
        default:
            query = query.order('created_at', {
                ascending: false,
            });
            break;
    }

    /**
     * OPTIONAL SORT OVERRIDES
     */
    if (sortBy === 'price-low') {
        query = query.order('price', {
            ascending: true,
        });
    }

    if (sortBy === 'price-high') {
        query = query.order('price', {
            ascending: false,
        });
    }

    /**
     * ABORT SUPPORT
     */
    if (signal) {
        query = query.abortSignal(signal);
    }

    const { data, error, count } = await query;

    /**
     * ABORTED REQUEST
     */
    if (error?.name === 'AbortError') {
        return {
            products: [],
            hasMore: false,
            total: 0,
        };
    }

    /**
     * QUERY ERROR
     */
    if (error) {
        console.error('[fetchProducts] Error:', error.message);
        console.error('[fetchProducts] Code:', error.code);
        console.error('[fetchProducts] Details:', error.details);
        console.error('[fetchProducts] Hint:', error.hint);

        throw new Error(error.message);
    }

    const rawProducts = data || [];

    /**
     * Manual seller hydration
     */
    const sellerIds = [
        ...new Set(
            rawProducts
                .map((p) => p.seller_id)
                .filter(Boolean)
        ),
    ];

    const sellerMap = await fetchSellerProfiles(sellerIds);

    const products = rawProducts.map((product) =>
        normalizeProduct(product, sellerMap)
    );

    return {
        products,
        total: count || 0,
        hasMore: products.length === pageSize,
    };
}

/**
 * Fetch products by IDs.
 */
export async function fetchProductsByIds(
    ids = [],
    signal = null
) {
    if (!ids.length) {
        return [];
    }

    let query = supabase
        .from('products')
        .select(PRODUCT_SELECT)
        .in('id', ids)
        .eq('is_active', true);

    if (signal) {
        query = query.abortSignal(signal);
    }

    const { data, error } = await query;

    if (error?.name === 'AbortError') {
        return [];
    }

    if (error) {
        console.error('[fetchProductsByIds]', error);

        throw new Error(error.message);
    }

    const rawProducts = data || [];

    const sellerIds = [
        ...new Set(
            rawProducts
                .map((p) => p.seller_id)
                .filter(Boolean)
        ),
    ];

    const sellerMap = await fetchSellerProfiles(sellerIds);

    return rawProducts.map((product) =>
        normalizeProduct(product, sellerMap)
    );
}