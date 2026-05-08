// services/categoryService.js — Enterprise Taxonomy Service
// Manages industry hierarchies, metadata, and immersive configurations.

import { 
    MARKETPLACE_CATEGORIES, 
    getCategoryBySlug, 
    getCategoryStats 
} from '@/lib/marketplace/taxonomy';
import { resolveIndustrySlug } from '@/utils/slugResolver';

/**
 * Get full industry context for a route.
 */
export async function getIndustryContext(slug) {
    if (slug === 'all') {
        return {
            type: 'all',
            title: 'All Industries',
            data: null,
            stats: getCategoryStats()
        };
    }

    const resolved = resolveIndustrySlug(slug);
    if (!resolved) return null;

    return {
        ...resolved,
        // Ensure immersive_config is always present even if empty
        immersive: resolved.data?.immersive_config || { scene_id: null },
        ai_metadata: resolved.data?.ai_metadata || { vector_boost: 1.0 }
    };
}

/**
 * Get all available categories for discovery components.
 */
export async function getAllCategories() {
    return MARKETPLACE_CATEGORIES;
}

/**
 * Get related subcategories for a given context.
 */
export async function getRelatedNiches(slug) {
    const context = await getIndustryContext(slug);
    if (!context) return [];

    if (context.type === 'category') {
        return context.data.subcategories || [];
    }

    if (context.type === 'subcategory' && context.parent) {
        return context.parent.subcategories || [];
    }

    return [];
}
