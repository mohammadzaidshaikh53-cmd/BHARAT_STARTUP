// services/searchService.js — Enterprise Marketplace Search
// Encapsulates complex Postgres FTS and prepares for AI Vector Search.

import { supabase } from '@/lib/supabase';

/**
 * Prepare search query for Postgres Websearch syntax.
 */
function formatSearchQuery(raw) {
    if (!raw?.trim()) return null;
    // Clean and format for Postgres textSearch
    const cleaned = raw.replace(/[&|!():*]/g, ' ').trim();
    if (!cleaned) return null;
    return cleaned.split(/\s+/).filter(w => w.length > 0).join(' & ');
}

/**
 * Execute a high-performance marketplace search.
 */
export async function searchProducts({
    term = '',
    categorySlug = null,
    limit = 20,
    offset = 0
} = {}) {
    const searchQuery = formatSearchQuery(term);
    
    let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('is_active', true);

    if (searchQuery) {
        // Current: Full Text Search
        query = query.textSearch('search_vector', searchQuery, {
            config: 'simple',
            type: 'websearch',
        });
        
        // Future: Hybrid Search Placeholder
        // const vectorResults = await performVectorSimilarity(term);
        // query = query.in('id', [...ftsIds, ...vectorResults]);
    }

    if (categorySlug && categorySlug !== 'all') {
        query = query.or(`category_slug.eq.${categorySlug},category.eq.${categorySlug}`);
    }

    const from = offset;
    const to = offset + limit - 1;
    
    const { data, error, count } = await query
        .range(from, to)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return {
        results: data || [],
        total: count || 0
    };
}
