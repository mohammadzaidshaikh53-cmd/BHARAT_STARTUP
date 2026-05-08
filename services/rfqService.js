// services/rfqService.js — RFQ/Buyer Request service layer
// Reuses existing 'requests' table with enhanced querying patterns
// No new Supabase tables required — extends existing schema

import { supabase } from '@/lib/supabase';

/**
 * Fetch all active RFQs with filters
 */
export async function fetchRFQs({
  category = null,
  location = null,
  budgetMin = null,
  budgetMax = null,
  searchTerm = null,
  page = 0,
  pageSize = 12,
  sortBy = 'newest',
} = {}) {
  try {
    let query = supabase
      .from('requests')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    if (category) query = query.eq('category', category);
    if (location) query = query.ilike('location', `%${location}%`);
    if (budgetMin) query = query.gte('budget', budgetMin);
    if (budgetMax) query = query.lte('budget', budgetMax);
    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    // Sorting
    switch (sortBy) {
      case 'budget-high':
        query = query.order('budget', { ascending: false, nullsFirst: false });
        break;
      case 'budget-low':
        query = query.order('budget', { ascending: true, nullsFirst: false });
        break;
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    const from = page * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      rfqs: data || [],
      total: count || 0,
      hasMore: (data?.length || 0) === pageSize,
      page,
    };
  } catch (err) {
    console.error('[rfqService.fetchRFQs]', err);
    return { rfqs: [], total: 0, hasMore: false, page };
  }
}

/**
 * Get a single RFQ by ID
 */
export async function getRFQById(id) {
  try {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[rfqService.getRFQById]', err);
    return null;
  }
}

/**
 * Create a new RFQ (enhanced request)
 */
export async function createRFQ({
  title,
  description,
  category,
  location,
  budget,
  whatsapp,
  quantity,
  delivery_timeline,
  urgency,
}) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('Authentication required');

    const insertData = {
      title: title?.trim(),
      description: description?.trim() || null,
      category: category?.trim(),
      location: location?.trim(),
      budget: budget ? parseInt(budget, 10) : null,
      whatsapp: whatsapp?.trim(),
      quantity: quantity || null,
      delivery_timeline: delivery_timeline || null,
      urgency: urgency || null,
      user_id: user.id,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('requests').insert([insertData]).select('id').single();
    if (error) throw error;

    return { success: true, data };
  } catch (err) {
    console.error('[rfqService.createRFQ]', err);
    return { success: false, error: err.message };
  }
}

/**
 * Close/deactivate an RFQ
 */
export async function closeRFQ(id) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required');

    const { error } = await supabase
      .from('requests')
      .update({ is_active: false })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('[rfqService.closeRFQ]', err);
    return { success: false, error: err.message };
  }
}

/**
 * Get RFQ stats for dashboard
 */
export async function getRFQStats(userId) {
  try {
    const { count: activeCount } = await supabase
      .from('requests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true);

    const { count: totalCount } = await supabase
      .from('requests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    return {
      active: activeCount || 0,
      total: totalCount || 0,
      closed: (totalCount || 0) - (activeCount || 0),
    };
  } catch (err) {
    console.error('[rfqService.getRFQStats]', err);
    return { active: 0, total: 0, closed: 0 };
  }
}
