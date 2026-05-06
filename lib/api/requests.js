import { supabase } from '@/lib/supabase';

export async function fetchAllRequests() {
  const { data, error } = await supabase
    .from('requests')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchRecentRequests(limit = 6) {
  const { data, error } = await supabase
    .from('requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function fetchRequestsByCategory(category) {
  const { data, error } = await supabase
    .from('requests')
    .select('*')
    .ilike('category', `%${category}%`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}