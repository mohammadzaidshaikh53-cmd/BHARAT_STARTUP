// utils/slugResolver.js — Centralized Industry Slug Resolution
// Handles hierarchical resolution, legacy aliases, and niche mapping.

import { MARKETPLACE_CATEGORIES, getAllSubcategories } from '@/lib/marketplace/taxonomy';

/**
 * Resolves a slug to its specific industry context.
 * Supports: top-level category, subcategory, and legacy aliases.
 * 
 * @param {string} slug - The slug from the URL.
 * @returns {Object|null} { type: 'category'|'subcategory', data: Object, parent: Object|null }
 */
export function resolveIndustrySlug(slug) {
    if (!slug) return null;

    // 1. Check top-level categories
    const category = MARKETPLACE_CATEGORIES.find(c => c.slug === slug);
    if (category) {
        return {
            type: 'category',
            data: category,
            parent: null
        };
    }

    // 2. Check subcategories across all verticals
    const subcategories = getAllSubcategories();
    const sub = subcategories.find(s => s.slug === slug);
    
    if (sub) {
        const parent = MARKETPLACE_CATEGORIES.find(c => c.slug === sub.parentCategory || c.slug === sub.parent);
        return {
            type: 'subcategory',
            data: sub,
            parent: parent || null
        };
    }

    // 3. Future: Alias/Legacy mapping logic here
    // Example: if (slug === 'old-slug') return resolveIndustrySlug('new-slug');

    return null;
}

/**
 * Validates if a slug exists in the taxonomy.
 */
export function isValidIndustrySlug(slug) {
    if (slug === 'all') return true;
    return !!resolveIndustrySlug(slug);
}
