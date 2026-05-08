// services/eventService.js — Lightweight expo/event service
import { supabase } from '@/lib/supabase';

/**
 * Fetch all events with filters from the database
 */
export async function fetchEvents({
  industry = null,
  city = null,
  status = 'upcoming',
  searchTerm = null,
  page = 0,
  pageSize = 12,
} = {}) {
  try {
    let query = supabase
      .from('events')
      .select('*', { count: 'exact' });

    if (industry) query = query.ilike('industry', `%${industry}%`);
    if (city) query = query.ilike('city', `%${city}%`);
    if (status) query = query.eq('status', status);
    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    const from = page * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to).order('date_start', { ascending: true });

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      events: data || [],
      total: count || 0,
      hasMore: (data?.length || 0) === pageSize,
      page,
    };
  } catch (err) {
    console.error('[eventService.fetchEvents]', err);
    return { events: [], total: 0, hasMore: false, page };
  }
}

/**
 * Get a single event by ID including sessions and exhibitors
 */
export async function getEventById(id) {
  try {
    const { data: event, error } = await supabase
      .from('events')
      .select('*, event_sessions(*), event_exhibitors(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return event;
  } catch (err) {
    console.error('[eventService.getEventById]', err);
    return null;
  }
}

/**
 * Register a user for an event
 */
export async function registerForEvent(eventId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required');

    const { error } = await supabase
      .from('event_registrations')
      .insert([{ event_id: eventId, user_id: user.id, registered_at: new Date().toISOString() }]);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('[eventService.registerForEvent]', err);
    return { success: false, error: err.message };
  }
}

/**
 * Add an exhibitor to an event
 */
export async function addExhibitor({ event_id, company_name, industry, booth_number, products = [] }) {
  try {
    const { error } = await supabase
      .from('event_exhibitors')
      .insert([{
        event_id,
        company_name,
        industry,
        booth_number,
        products
      }]);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('[eventService.addExhibitor]', err);
    return { success: false, error: err.message };
  }
}

/**
 * Get upcoming events count for dashboard
 */
export async function getUpcomingEventsCount() {
  try {
    const { count, error } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'upcoming');

    if (error) throw error;
    return count || 0;
  } catch (err) {
    console.error('[eventService.getUpcomingEventsCount]', err);
    return 0;
  }
}

/**
 * Get event industries for filter (unique list from DB)
 */
export async function getEventIndustries() {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('industry')
      .order('industry');
    
    if (error) throw error;
    return [...new Set(data.map(item => item.industry))];
  } catch (err) {
    console.error('[eventService.getEventIndustries]', err);
    return [];
  }
}

/**
 * Get event cities for filter (unique list from DB)
 */
export async function getEventCities() {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('city')
      .order('city');

    if (error) throw error;
    return [...new Set(data.map(item => item.city))];
  } catch (err) {
    console.error('[eventService.getEventCities]', err);
    return [];
  }
}
