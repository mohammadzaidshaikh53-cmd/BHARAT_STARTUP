import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Fetch organizations with filters and sorting (non-paginated, basic version)
 * @param {Object} options
 * @param {string} options.search - search term (name or description)
 * @param {boolean} options.verifiedOnly - only verified organizations
 * @param {string} options.sortBy - 'trust_desc', 'members_desc', 'newest'
 * @returns {Promise<{data: Array, error: Error}>}
 */
export async function fetchOrganizations({ search = '', verifiedOnly = false, sortBy = 'trust_desc' }) {
  let query = supabase
    .from('organizations')
    .select(`
      *,
      industry:industries(name, slug)
    `);

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

  const { data, error } = await query;

  if (error) {
    return { data: null, error };
  }

  // Normalize industry field
  const normalized = data.map(org => ({
    ...org,
    industry_name: org.industry?.name || null,
    industry_slug: org.industry?.slug || null,
  }));

  return { data: normalized, error: null };
}

/**
 * Fetch a single industry by slug
 * @param {string} slug - industry slug
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function fetchIndustryBySlug(slug) {
  const { data, error } = await supabase
    .from('industries')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return { data: null, error };
  return { data, error: null };
}

/**
 * Fetch organizations by industry slug (paginated, for infinite scroll)
 * @param {Object} options
 * @param {string} options.industrySlug
 * @param {string} options.search
 * @param {boolean} options.verifiedOnly
 * @param {string} options.sortBy - 'trust_desc' or 'members_desc'
 * @param {number} options.pageParam - page number (0-indexed)
 * @returns {Promise<{data: Array, nextPage: number|null, error: Error|null, count: number}>}
 */
export async function fetchOrganizationsByIndustry({
  industrySlug,
  search = '',
  verifiedOnly = false,
  sortBy = 'trust_desc',
  pageParam = 0,
}) {
  const pageSize = 12;
  const from = pageParam * pageSize;
  const to = (pageParam + 1) * pageSize - 1;

  // First get the industry id from slug
  const { data: industryData, error: industryError } = await supabase
    .from('industries')
    .select('id')
    .eq('slug', industrySlug)
    .single();

  if (industryError) return { data: null, nextPage: undefined, error: industryError, count: 0 };

  let query = supabase
    .from('organizations')
    .select('*, industry:industries(name, slug)', { count: 'exact' })
    .eq('industry_id', industryData.id)
    .range(from, to);

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
  }

  const { data, error, count } = await query;
  if (error) return { data: null, nextPage: undefined, error, count: 0 };

  const normalized = data.map(org => ({
    ...org,
    industry_name: org.industry?.name || null,
    industry_slug: org.industry?.slug || null,
  }));

  const hasMore = data.length === pageSize;
  const nextPage = hasMore ? pageParam + 1 : undefined;

  return { data: normalized, nextPage, error: null, count };
}

/**
 * Fetch all industries (for industries browser page)
 * @returns {Promise<{data: Array, error: Error}>}
 */
export async function fetchIndustries() {
  const { data, error } = await supabase
    .from('industries')
    .select('*')
    .order('name');

  if (error) {
    return { data: null, error };
  }
  return { data, error: null };
}

/**
 * Subscribe to real-time trust score updates for a single organization
 * @param {string} orgId - Organization UUID
 * @param {function} callback - Function called with new trust_score on update
 * @returns {function} Unsubscribe function
 */
export function subscribeToTrustUpdates(orgId, callback) {
  const channel = supabase
    .channel(`org-trust-${orgId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'organizations',
        filter: `id=eq.${orgId}`,
      },
      (payload) => {
        const newTrustScore = payload.new.trust_score ?? payload.new.reputation_score ?? null;
        if (newTrustScore !== null) {
          callback(newTrustScore);
        }
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Fetch a single organization by slug (for public profile)
 * @param {string} slug - organization slug
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function fetchOrganizationBySlug(slug) {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return { data: null, error };
  return { data, error: null };
}

/**
 * Fetch trust vectors for an organization (from organization_trust_vectors)
 * @param {string} orgId - organization UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function fetchOrganizationTrustVectors(orgId) {
  const { data, error } = await supabase
    .from('organization_trust_vectors')
    .select('*')
    .eq('organization_id', orgId)
    .single();

  if (error) return { data: null, error };
  return { data, error: null };
}

/**
 * Fetch relationships (partners/connections) for an organization
 * @param {string} orgId - organization UUID
 * @param {string} type - relationship type (e.g., 'partner')
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export async function fetchOrganizationRelationships(orgId, type = 'partner') {
  const { data, error } = await supabase
    .from('organization_relationships')
    .select(`
      target_org_id,
      relationship_type,
      trust_level,
      organization:target_org_id(name, slug, trust_tier)
    `)
    .eq('source_org_id', orgId)
    .eq('relationship_type', type)
    .eq('status', 'active')
    .eq('is_public', true);

  if (error) return { data: null, error };
  const normalized = (data || []).map(rel => ({
    id: rel.target_org_id,
    name: rel.organization?.name,
    slug: rel.organization?.slug,
    trust_tier: rel.organization?.trust_tier,
    trust_level: rel.trust_level,
  }));
  return { data: normalized, error: null };
}

/**
 * Fetch team members (organization_members joined with users)
 * @param {string} orgId - organization UUID
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export async function fetchOrganizationMembers(orgId) {
  const { data, error } = await supabase
    .from('organization_members')
    .select(`
      user_id,
      role,
      users:user_id(full_name, avatar_url)
    `)
    .eq('organization_id', orgId)
    .eq('is_active', true);

  if (error) return { data: null, error };
  const normalized = (data || []).map(member => ({
    id: member.user_id,
    name: member.users?.full_name || 'Member',
    avatar: member.users?.avatar_url,
    role: member.role,
  }));
  return { data: normalized, error: null };
}

/**
 * Fetch products for an organization from marketplace_products
 * @param {string} orgId - organization UUID
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export async function fetchOrganizationProducts(orgId) {
  const { data, error } = await supabase
    .from('marketplace_products')
    .select('id, name, price, status, description')
    .eq('organization_id', orgId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) return { data: null, error };
  return { data, error: null };
}