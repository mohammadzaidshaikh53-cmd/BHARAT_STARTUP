// services/supplierService.js — Supplier discovery and profile service
// Uses existing seller_profiles + products tables with trust scoring overlay

import { supabase } from '@/lib/supabase';
import { calculateTrustScore, estimateResponseTime, getProfileCompletionSteps } from '@/lib/trust/trustCalculator';

/**
 * Fetch suppliers with filters for discovery page
 */
export async function fetchSuppliers({
  industry = null,
  location = null,
  searchTerm = null,
  verifiedOnly = false,
  page = 0,
  pageSize = 12,
  sortBy = 'trust',
} = {}) {
  try {
    let query = supabase
      .from('seller_profiles')
      .select('*, products(id, image_url, description, whatsapp, category, price, product_stats(*))', { count: 'exact' });

    if (location) query = query.ilike('location', `%${location}%`);
    if (searchTerm) {
      query = query.or(`full_name.ilike.%${searchTerm}%,company_name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%`);
    }
    if (verifiedOnly) query = query.eq('verification_status', 'verified');

    query = query.order('created_at', { ascending: false });

    const from = page * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    // Calculate trust scores for each supplier
    const suppliers = (data || []).map((seller) => {
      const trust = calculateTrustScore(seller, seller.products || []);
      const responseTime = estimateResponseTime(seller);
      return {
        ...seller,
        trustScore: trust.total,
        trustLevel: trust.level,
        trustBadge: trust.badge,
        responseTime,
        productCount: seller.products?.length || 0,
      };
    });

    // Sort by trust score if requested
    if (sortBy === 'trust') {
      suppliers.sort((a, b) => b.trustScore - a.trustScore);
    } else if (sortBy === 'products') {
      suppliers.sort((a, b) => b.productCount - a.productCount);
    }

    return {
      suppliers,
      total: count || 0,
      hasMore: (data?.length || 0) === pageSize,
      page,
    };
  } catch (err) {
    console.error('[supplierService.fetchSuppliers]', err);
    return { suppliers: [], total: 0, hasMore: false, page };
  }
}

/**
 * Get full supplier profile by ID
 */
export async function getSupplierProfile(userId) {
  try {
    const { data: seller, error } = await supabase
      .from('seller_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    if (!seller) return null;

    // Fetch seller's products
    const { data: products } = await supabase
      .from('products')
      .select('*, product_stats(*)')
      .eq('seller_id', userId)
      .order('created_at', { ascending: false });

    const trust = calculateTrustScore(seller, products || []);
    const responseTime = estimateResponseTime(seller);
    const completion = getProfileCompletionSteps(seller);

    return {
      ...seller,
      products: products || [],
      trustScore: trust.total,
      trustBreakdown: trust.breakdown,
      trustLevel: trust.level,
      trustBadge: trust.badge,
      responseTime,
      profileCompletion: completion,
      productCount: products?.length || 0,
    };
  } catch (err) {
    console.error('[supplierService.getSupplierProfile]', err);
    return null;
  }
}

/**
 * Get featured suppliers (highest trust scores)
 */
export async function getFeaturedSuppliers(limit = 6) {
  try {
    const { data, error } = await supabase
      .from('seller_profiles')
      .select('*, products(id, image_url, description, whatsapp, category)')
      .eq('verification_status', 'verified')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map((seller) => {
      const trust = calculateTrustScore(seller, seller.products || []);
      return {
        ...seller,
        trustScore: trust.total,
        trustBadge: trust.badge,
        productCount: seller.products?.length || 0,
      };
    }).sort((a, b) => b.trustScore - a.trustScore);
  } catch (err) {
    console.error('[supplierService.getFeaturedSuppliers]', err);
    return [];
  }
}

/**
 * Get suppliers by location for local sourcing
 */
export async function getLocalSuppliers(location, limit = 12) {
  try {
    const { data, error } = await supabase
      .from('seller_profiles')
      .select('*, products(id, image_url, category, name, price)')
      .ilike('location', `%${location}%`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map((seller) => {
      const trust = calculateTrustScore(seller, seller.products || []);
      return {
        ...seller,
        trustScore: trust.total,
        trustBadge: trust.badge,
        productCount: seller.products?.length || 0,
      };
    });
  } catch (err) {
    console.error('[supplierService.getLocalSuppliers]', err);
    return [];
  }
}
