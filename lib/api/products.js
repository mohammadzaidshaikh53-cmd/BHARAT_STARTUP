import { supabase } from '@/lib/supabase';

export async function fetchAllProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchProductById(id) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchProductsByCategory(category) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchTrendingProducts(limit = 8) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('views', { ascending: false, nullsLast: true })
    .limit(limit);
  if (error) throw error;
  return data || [];
}