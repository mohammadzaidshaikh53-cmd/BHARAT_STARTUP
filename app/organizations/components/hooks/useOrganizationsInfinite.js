// app/organizations/components/hooks/useOrganizationsInfinite.js

import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '../data'; // keep existing import

const PAGE_SIZE = 12;

// Columns known to exist in the organizations table for sorting
const SAFE_SORT_COLUMNS = {
  newest: { column: 'created_at', ascending: false },
  members_desc: { column: 'member_count', ascending: false },
};

export async function fetchOrganizationsPage({
  pageParam = 0,
  search = '',
  verifiedOnly = false,
  sortBy = 'newest', // default to a column we know exists
}) {
  if (!supabase || typeof supabase.from !== 'function') {
    throw new Error('Supabase client not available');
  }

  // Determine sort column/order, falling back to 'newest' if a risky column is requested
  const getSort = (field) => {
    if (field === 'trust_desc') {
      // trust_score column does NOT exist yet – fallback to newest
      return { column: 'created_at', ascending: false };
    }
    return SAFE_SORT_COLUMNS[field] || { column: 'created_at', ascending: false };
  };

  const { column, ascending } = getSort(sortBy);

  // Main query with join
  const mainQuery = supabase
    .from('organizations')
    .select(`*, industry:industries(name, slug)`, { count: 'exact' })
    .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1);

  if (search) {
    mainQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }
  if (verifiedOnly) {
    mainQuery.eq('verification_status', 'verified');
  }
  mainQuery.order(column, { ascending });

  let { data, error, count } = await mainQuery;

  // If the main query fails, try a simple * query without join
  if (error) {
    // Log the real error now (it will have a message)
    console.error('Primary query error:', error.message);

    const fallbackQuery = supabase
      .from('organizations')
      .select('*', { count: 'exact' })
      .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1);

    if (search) {
      fallbackQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (verifiedOnly) {
      fallbackQuery.eq('verification_status', 'verified');
    }
    fallbackQuery.order(column, { ascending });

    ({ data, error, count } = await fallbackQuery);
    if (error) {
      console.error('Fallback query also failed:', error.message);
      throw new Error('Unable to load organisations. Please try again later.');
    }
  }

  const normalized = (data || []).map((org) => ({
    ...org,
    industry_name: org.industry?.name || null,
    industry_slug: org.industry?.slug || null,
  }));

  return {
    data: normalized,
    nextPage: data?.length === PAGE_SIZE ? pageParam + 1 : undefined,
    count: count ?? 0,
  };
}

export function useOrganizationsInfinite({ search, verifiedOnly, sortBy = 'newest' }) {
  return useInfiniteQuery({
    queryKey: ['organizations', 'infinite', { search, verifiedOnly, sortBy }],
    queryFn: ({ pageParam }) =>
      fetchOrganizationsPage({ pageParam, search, verifiedOnly, sortBy }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 1000 * 60,
    retry: 1,
  });
}