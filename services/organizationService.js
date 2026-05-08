// services/organizationService.js — Organization management service
import { supabase } from '@/lib/supabase';

/**
 * Get organization by ID with membership validation
 */
export async function getOrganizationById(id) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required');

    // Fetch organization details
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('*, industry:industries(name, slug)')
      .eq('id', id)
      .single();

    if (orgError) throw orgError;

    // Verify membership and role
    const { data: membership, error: memError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', id)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (memError || !membership) {
      throw new Error('Not authorized to access this organization dashboard');
    }

    return {
      ...organization,
      userRole: membership.role,
    };
  } catch (err) {
    console.error('[organizationService.getOrganizationById]', err);
    return null;
  }
}

/**
 * Get organization stats (products, members, trust)
 */
export async function getOrganizationStats(orgId) {
  try {
    const [
      { count: productCount },
      { count: memberCount },
      { data: orgData }
    ] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
      supabase.from('organization_members').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('is_active', true),
      supabase.from('organizations').select('trust_score').eq('id', orgId).single()
    ]);

    return {
      trustScore: orgData?.trust_score || 0,
      memberCount: memberCount || 0,
      productCount: productCount || 0,
      // Mock revenue as it's not yet in schema
      monthlyRevenue: 0, 
    };
  } catch (err) {
    console.error('[organizationService.getOrganizationStats]', err);
    return { trustScore: 0, memberCount: 0, productCount: 0, monthlyRevenue: 0 };
  }
}

/**
 * Get recent activity for an organization
 */
export async function getRecentActivity(orgId, limit = 5) {
  try {
    // This would typically query an 'activity_log' table
    // For now, we'll fetch recently joined members and new products
    const [
      { data: members },
      { data: products }
    ] = await Promise.all([
      supabase.from('organization_members')
        .select('created_at, role, users:user_id(full_name)')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })
        .limit(limit),
      supabase.from('products')
        .select('created_at, name')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })
        .limit(limit)
    ]);

    const activities = [
      ...(members || []).map(m => ({
        text: `New member ${m.users?.full_name} joined as ${m.role}`,
        time: m.created_at,
        type: 'member'
      })),
      ...(products || []).map(p => ({
        text: `New product "${p.name}" listed`,
        time: p.created_at,
        type: 'product'
      }))
    ];

    return activities.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, limit);
  } catch (err) {
    console.error('[organizationService.getRecentActivity]', err);
    return [];
  }
}
