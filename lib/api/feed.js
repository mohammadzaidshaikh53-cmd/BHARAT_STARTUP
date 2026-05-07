import { supabase } from '@/lib/supabase';

export async function fetchPersonalizedFeed(userId, limit = 20, cursorScore = 1.0, cursorId = null) {
  const { data, error } = await supabase.rpc('get_personalized_feed_v8', {
    p_user_id: userId,
    p_limit: limit,
    p_cursor_score: cursorScore,
    p_cursor_id: cursorId,
  });
  if (error) throw error;
  return data || [];
}

export async function fetchPostBySlug(slug) {
  const { data, error } = await supabase
    .from('content_posts')
    .select(`
      id, title, slug, content, excerpt, featured_image,
      published_at, category_id, tags, author_id,
      category:content_categories(name),
      author:users(id, raw_user_meta_data)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  if (error) throw error;
  return data;
}

export async function fetchRelatedPosts(postId, tags, limit = 4) {
  if (!tags?.length) return [];
  const { data, error } = await supabase
    .from('content_posts')
    .select('id, title, slug, excerpt, featured_image, published_at')
    .eq('status', 'published')
    .neq('id', postId)
    .contains('tags', tags.slice(0, 2))
    .order('published_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}