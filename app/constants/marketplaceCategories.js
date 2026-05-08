// constants/marketplaceCategories.js — Unified B2B Industry Taxonomy re-exports

import {
    MARKETPLACE_CATEGORIES as UNIFIED_CATEGORIES,
    FEATURED_CATEGORIES as UNIFIED_FEATURED,
    ALL_CATEGORIES_SORTED as UNIFIED_SORTED,
    getCategoryBySlug as unifiedGetCategoryBySlug,
    getSubcategoryBySlug as unifiedGetSubcategoryBySlug,
    getAllSubcategories as unifiedGetAllSubcategories,
    getCategoryStats as unifiedGetCategoryStats
} from '@/lib/marketplace/taxonomy';

export const MARKETPLACE_CATEGORIES = UNIFIED_CATEGORIES;

export const FEATURED_CATEGORIES = UNIFIED_FEATURED;

export const ALL_CATEGORIES_SORTED = UNIFIED_SORTED;

export const getCategoryBySlug = unifiedGetCategoryBySlug;

export const getSubcategoryBySlug = unifiedGetSubcategoryBySlug;

export const getAllSubcategories = unifiedGetAllSubcategories;

export const getCategoryStats = unifiedGetCategoryStats;