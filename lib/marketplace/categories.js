// lib/marketplace/categories.js — Comprehensive B2B category taxonomy (Re-exporting from unified taxonomy)

import {
    MARKETPLACE_CATEGORIES as UNIFIED_CATEGORIES,
    getFeaturedCategories as unifiedGetFeaturedCategories,
    getCategoryBySlug as unifiedGetCategoryBySlug,
    getAllSubcategories as unifiedGetAllSubcategories,
    getCategoryStats as unifiedGetCategoryStats
} from './taxonomy';

export const MARKETPLACE_CATEGORIES = UNIFIED_CATEGORIES;

// ─── HELPERS ───

export const getFeaturedCategories = unifiedGetFeaturedCategories;

export const getCategoryBySlug = unifiedGetCategoryBySlug;

export const getAllSubcategories = unifiedGetAllSubcategories;

export const getCategoryStats = unifiedGetCategoryStats;