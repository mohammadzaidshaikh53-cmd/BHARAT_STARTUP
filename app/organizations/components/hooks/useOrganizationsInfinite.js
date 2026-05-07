import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '../data';

const PAGE_SIZE = 12;

export async function fetchOrganizationsPage({ pageParam = 0, search = '', verifiedOnly = false, sortBy = 'trust_desc' }) {
  let query = supabase
    .from('organizations')
    .select(`
      *,
      industry:industries(name, slug)
    `, { count: 'exact' })
    .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1);

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }
  if (verifiedOnly) {
    query = query.eq('verification_status', 'verified');
  }
  if (sortBy === 'trust_desc') {
    query = query.order('trust_score', { ascending: false });
  } else if (sortBy === 'members_desc') {
    query = query.order('member_count', { ascending: false });
  } else if (sortBy === 'newest') {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Supabase error in fetchOrganizationsPage:', error);
    throw new Error(error.message);
  }

  const normalized = (data || []).map(org => ({
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

export function useOrganizationsInfinite({ search, verifiedOnly, sortBy }) {
  return useInfiniteQuery({
    queryKey: ['organizations', 'infinite', { search, verifiedOnly, sortBy }],
    queryFn: ({ pageParam }) => fetchOrganizationsPage({ pageParam, search, verifiedOnly, sortBy }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 1000 * 60, // 1 minute
    // Optional: add retry logic
    retry: 1,
  });
}