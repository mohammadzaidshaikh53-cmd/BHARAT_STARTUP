import { supabase } from '@/lib/supabase';
import { generateUniqueSlug } from '@/lib/utils/slugify';
import { validateContent } from '@/lib/utils/validateContent';

// ============================================================================
// ERROR HANDLER
// ============================================================================
function handleServiceError(error, context) {
  const errorInfo = {
    context,
    message: error?.message || 'Unknown error',
    details: error?.details || null,
    hint: error?.hint || null,
    code: error?.code || null,
  };
  console.error('ContentService Error:', errorInfo);
  return {
    success: false,
    error: errorInfo.message,
    details: errorInfo,
  };
}

// ============================================================================
// AUTH HELPERS
// ============================================================================
async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error(error?.message || 'User not authenticated');
  }
  return user;
}

function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];
  return tags
    .map(t => typeof t === 'string' ? t.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-') : '')
    .filter(Boolean)
    .slice(0, 5);
}

// ============================================================================
// CREATE IDEA
// ============================================================================
export async function createIdea({ title, description, category, impact_level, tags }) {
  try {
    const user = await getCurrentUser();
    const validation = validateContent({ title, content: description });
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(', ') };
    }

    generateUniqueSlug(title, 'idea')        // for ideas
generateUniqueSlug(title, 'blog')        // for blogs
generateUniqueSlug(title, 'question')    // for Q&A
generateUniqueSlug(title, 'discussion')  // etc
    const normalizedTags = normalizeTags(tags);

    const payload = {
      user_id: user.id,
      title: title.trim(),
      description: description.trim(),
      category: category?.trim() || null,
      impact_level: Math.min(Math.max(Number(impact_level) || 5, 1), 10),
      tags: normalizedTags,
      slug,
      content_type: 'idea',
      status: 'published',
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('ideas').insert(payload).select('id').single();
    if (error) throw error;

    return { success: true, data, slug };
  } catch (err) {
    return handleServiceError(err, 'createIdea');
  }
}

// ============================================================================
// CREATE DISCUSSION
// ============================================================================
export async function createDiscussion({ title, content, discussion_type, tags }) {
  try {
    const user = await getCurrentUser();
    const validation = validateContent({ title, content });
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(', ') };
    }

    const slug = generateUniqueSlug(title);
    const normalizedTags = normalizeTags(tags);

    const payload = {
      user_id: user.id,
      title: title.trim(),
      content: content.trim(),
      discussion_type: discussion_type?.trim() || 'general',
      tags: normalizedTags,
      slug,
      content_type: 'discussion',
      status: 'published',
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('discussions').insert(payload).select('id').single();
    if (error) throw error;

    return { success: true, data, slug };
  } catch (err) {
    return handleServiceError(err, 'createDiscussion');
  }
}

// ============================================================================
// CREATE QUESTION (Q&A)
// ============================================================================
export async function createQuestion({ title, content, tags, bounty_points }) {
  try {
    const user = await getCurrentUser();
    const validation = validateContent({ title, content });
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(', ') };
    }

    const slug = generateUniqueSlug(title);
    const normalizedTags = normalizeTags(tags);

    const payload = {
      user_id: user.id,
      title: title.trim(),
      content: content.trim(),
      tags: normalizedTags,
      bounty_points: Math.min(Math.max(Number(bounty_points) || 0, 0), 100),
      slug,
      content_type: 'question',
      status: 'published',
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('questions').insert(payload).select('id').single();
    if (error) throw error;

    return { success: true, data, slug };
  } catch (err) {
    return handleServiceError(err, 'createQuestion');
  }
}

// ============================================================================
// CREATE BIOGRAPHY
// ============================================================================
export async function createBiography({ subject_name, title, content, timeline_events, tags }) {
  try {
    const user = await getCurrentUser();
    const validation = validateContent({ title, content });
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(', ') };
    }

    const slug = generateUniqueSlug(title);
    const normalizedTags = normalizeTags(tags);

    const payload = {
      user_id: user.id,
      subject_name: subject_name?.trim() || title.trim(),
      title: title.trim(),
      content: content.trim(),
      timeline_events: Array.isArray(timeline_events) ? timeline_events : [],
      tags: normalizedTags,
      slug,
      content_type: 'biography',
      status: 'published',
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('biographies').insert(payload).select('id').single();
    if (error) throw error;

    return { success: true, data, slug };
  } catch (err) {
    return handleServiceError(err, 'createBiography');
  }
}

// ============================================================================
// CREATE MOTIVATION
// ============================================================================
export async function createMotivation({ title, content, quote, quote_author, mood, tags }) {
  try {
    const user = await getCurrentUser();
    const validation = validateContent({ title, content });
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(', ') };
    }

    const slug = generateUniqueSlug(title);
    const normalizedTags = normalizeTags(tags);

    const payload = {
      user_id: user.id,
      title: title.trim(),
      content: content.trim(),
      quote: quote?.trim() || null,
      quote_author: quote_author?.trim() || null,
      mood: mood?.trim() || 'motivational',
      tags: normalizedTags,
      slug,
      content_type: 'motivation',
      status: 'published',
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('motivation').insert(payload).select('id').single();
    if (error) throw error;

    return { success: true, data, slug };
  } catch (err) {
    return handleServiceError(err, 'createMotivation');
  }
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================
export async function refreshFeed() {
  try {
    const { error } = await supabase.rpc('refresh_community_feed');
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.warn('refresh_community_feed RPC not available:', err);
    return { success: false, error: err.message };
  }
}

// ============================================================================
// ENGAGEMENT
// ============================================================================
export async function recordEngagement(events) {
  try {
    if (!Array.isArray(events) || events.length === 0) {
      return { success: false, error: 'No events to record' };
    }
    const { error } = await supabase.rpc('batch_record_engagement_v2', { events });
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return handleServiceError(err, 'recordEngagement');
  }
}