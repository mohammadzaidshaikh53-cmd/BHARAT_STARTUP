// services/productService.js — Enterprise Product Data Layer
// Decouples Supabase queries from UI components.
// Prepared for Trust-scoring and AI-matchmaking.

import { supabase } from '@/lib/supabase';

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
 * Normalize product shape and hydrate with trust metrics.
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

    // Future placeholder: AI-calculated trust score
    const trust_score = product.trust_score || 85; 

    const seller = sellerMap.get(product.seller_id) || null;

    return {
        ...product,
        seller,
        // Backward compatibility: flatten key seller fields
        company_name: product.company_name || seller?.company_name || null,
        whatsapp: product.whatsapp || seller?.whatsapp || null,
        image_url: primaryImage?.url || null,
        product_stats: stats,
        trust_metrics: {
            score: trust_score,
            verified: product.verification_status === 'verified',
            growth_velocity: product.growth_velocity || 1.0
        }
    };
}

/**
 * Hydrate products with seller profiles.
 */
async function hydrateSellers(products = []) {
    const sellerIds = [...new Set(products.map(p => p.seller_id).filter(Boolean))];
    if (!sellerIds.length) return products.map(p => normalizeProduct(p));

    const { data, error } = await supabase
        .from('seller_profiles')
        .select('user_id, full_name, avatar_url, verified, company_name, whatsapp')
        .in('user_id', sellerIds);

    if (error) {
        console.error('[productService.hydrateSellers]', error);
        return products.map(p => normalizeProduct(p));
    }

    const sellerMap = new Map((data || []).map(s => [s.user_id, s]));
    return products.map(p => normalizeProduct(p, sellerMap));
}

/**
 * Fetch products with enterprise-grade filtering and pagination.
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

    // Search logic moved to searchService, but maintained here for backward-compat
    if (searchTerm?.trim()) {
        const term = `%${searchTerm.trim()}%`;
        query = query.or(`name.ilike.${term},description.ilike.${term},category.ilike.${term},location.ilike.${term}`);
    }

    if (category && category !== 'all') {
        // Handle both slug and title for backward compatibility
        query = query.or(`category_slug.eq.${category},category.eq.${category}`);
    }

    if (location) query = query.eq('location', location);
    if (minPrice !== null) query = query.gte('price', minPrice);
    if (maxPrice !== null) query = query.lte('price', maxPrice);
    if (feedType === 'deals') query = query.gt('discount_percent', 0);

    // Sorting
    switch (feedType) {
        case 'new-arrivals':
            query = query.order('created_at', { ascending: false });
            break;
        case 'deals':
            query = query.order('discount_percent', { ascending: false });
            break;
        case 'trending':
        default:
            query = query.order('created_at', { ascending: false });
            break;
    }

    if (sortBy === 'price-low') query = query.order('price', { ascending: true });
    if (sortBy === 'price-high') query = query.order('price', { ascending: false });

    if (signal) query = query.abortSignal(signal);

    const { data, error, count } = await query;

    if (error) throw error;

    const products = await hydrateSellers(data || []);

    return {
        products,
        total: count || 0,
        hasMore: products.length === pageSize,
    };
}

/**
 * Fetch a single product by ID with full B2B metadata.
 */
export async function getProductById(id, signal = null) {
    let query = supabase
        .from('products')
        .select(PRODUCT_SELECT)
        .eq('id', id)
        .single();

    if (signal) query = query.abortSignal(signal);

    const { data, error } = await query;
    if (error) throw error;

    const hydrated = await hydrateSellers([data]);
    return hydrated[0];
}

/**
 * Fetch multiple products by IDs (e.g. for "Saved" items).
 */
export async function getProductsByIds(ids = [], signal = null) {
    if (!ids.length) return [];

    let query = supabase
        .from('products')
        .select(PRODUCT_SELECT)
        .in('id', ids)
        .eq('is_active', true);

    if (signal) query = query.abortSignal(signal);

    const { data, error } = await query;
    if (error) throw error;

    return await hydrateSellers(data || []);
}
