/**
 * Store Service (Vendor Storefront)
 * Pattern from: Shopify, Squarespace, BigCommerce
 *
 * Provides:
 * - Store CRUD
 * - Product management
 * - Order tracking
 * - Analytics
 */

import { createClient } from '@/lib/supabase';

const supabase = createClient();

/**
 * Get store by ID or slug
 */
export async function getStore(storeId) {
  const { data, error } = await supabase
    .from('stores')
    .select(`
      *,
      owner:users(id, full_name, email, avatar_url),
      organization:organizations(*),
      products(*)
    `)
    .eq('id', storeId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get store by slug
 */
export async function getStoreBySlug(slug) {
  const { data, error } = await supabase
    .from('stores')
    .select(`
      *,
      owner:users(id, full_name, email, avatar_url),
      organization:organizations(*),
      products(*)
    `)
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get user's own store
 */
export async function getMyStore(userId) {
  const { data, error } = await supabase
    .from('stores')
    .select(`
      *,
      products(*),
      organization:organizations(*)
    `)
    .eq('owner_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No store yet
    throw error;
  }
  return data;
}

/**
 * Create a new store
 */
export async function createStore(userId, storeData) {
  const { data, error } = await supabase
    .from('stores')
    .insert({
      owner_id: userId,
      name: storeData.name,
      slug: storeData.slug || generateSlug(storeData.name),
      description: storeData.description,
      logo_url: storeData.logoUrl,
      cover_url: storeData.coverUrl,
      theme: storeData.theme || 'default',
      customization: storeData.customization || {},
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update store settings
 */
export async function updateStore(storeId, updates) {
  const { data, error } = await supabase
    .from('stores')
    .update(updates)
    .eq('id', storeId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get store products with pagination
 */
export async function getStoreProducts(storeId, { page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('store_id', storeId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return { products: data, total: count, page, totalPages: Math.ceil(count / limit) };
}

/**
 * Get store orders
 */
export async function getStoreOrders(storeId, { status, page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;

  let query = supabase
    .from('orders')
    .select(`
      *,
      buyer:users(id, full_name, email),
      items:order_items(
        *,
        product:products(name, images)
      )
    `, { count: 'exact' })
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error) throw error;
  return { orders: data, total: count, page, totalPages: Math.ceil(count / limit) };
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId, status, storeId) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .eq('store_id', storeId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get store analytics
 */
export async function getStoreAnalytics(storeId, { range = '30d' } = {}) {
  const days = parseRange(range);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const [orders, products, revenue] = await Promise.all([
    // Order counts
    supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .eq('store_id', storeId)
      .gte('created_at', startDate.toISOString()),

    // Products stats
    supabase
      .from('products')
      .select('status, created_at')
      .eq('store_id', storeId),

    // Revenue
    supabase
      .from('orders')
      .select('total_amount')
      .eq('store_id', storeId)
      .eq('status', 'completed')
      .gte('created_at', startDate.toISOString()),
  ]);

  const totalRevenue = revenue.data?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;

  return {
    totalOrders: orders.count || 0,
    totalProducts: products.data?.length || 0,
    activeProducts: products.data?.filter(p => p.status === 'active').length || 0,
    totalRevenue,
    period: range,
    breakdown: {
      pending: orders.data?.filter(o => o.status === 'pending').length || 0,
      processing: orders.data?.filter(o => o.status === 'processing').length || 0,
      completed: orders.data?.filter(o => o.status === 'completed').length || 0,
      cancelled: orders.data?.filter(o => o.status === 'cancelled').length || 0,
    },
  };
}

/**
 * Get sales chart data
 */
export async function getSalesChart(storeId, { range = '30d' } = {}) {
  const days = parseRange(range);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('orders')
    .select('created_at, total_amount')
    .eq('store_id', storeId)
    .eq('status', 'completed')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true });

  if (error) throw error;

  // Group by day
  const chartData = {};
  for (const order of data || []) {
    const date = new Date(order.created_at).toISOString().split('T')[0];
    chartData[date] = (chartData[date] || 0) + (order.total_amount || 0);
  }

  return Object.entries(chartData).map(([date, amount]) => ({ date, amount }));
}

/**
 * Get top products
 */
export async function getTopProducts(storeId, { limit = 10 } = {}) {
  const { data, error } = await supabase
    .from('order_items')
    .select(`
      product_id,
      product:products(id, name, images, price),
      quantity
    `)
    .eq('order.store_id', storeId)
    .eq('order.status', 'completed')
    .order('quantity', { ascending: false })
    .limit(limit);

  if (error) throw error;

  // Aggregate by product
  const productSales = {};
  for (const item of data || []) {
    if (!productSales[item.product_id]) {
      productSales[item.product_id] = {
        ...item.product,
        totalQuantity: 0,
        totalRevenue: 0,
      };
    }
    productSales[item.product_id].totalQuantity += item.quantity || 0;
    productSales[item.product_id].totalRevenue += (item.product?.price || 0) * (item.quantity || 0);
  }

  return Object.values(productSales).sort((a, b) => b.totalQuantity - a.totalQuantity);
}

// Helpers
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    + '-' + Date.now().toString(36);
}

function parseRange(range) {
  const map = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '365d': 365,
  };
  return map[range] || 30;
}
