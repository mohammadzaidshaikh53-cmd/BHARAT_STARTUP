import { supabase } from '@/lib/supabase';

// ----- SESSION-based seen cache (improvement #2) -----
const SESSION_SEEN_KEY = 'feed_session_seen';
const MAX_SEEN_CACHE = 150;

function getSessionSeen() {
  if (typeof window === 'undefined') return new Set();
  const cached = sessionStorage.getItem(SESSION_SEEN_KEY);
  return cached ? new Set(JSON.parse(cached)) : new Set();
}

function saveSessionSeen(seenSet) {
  if (typeof window === 'undefined') return;
  const seenArray = Array.from(seenSet).slice(-MAX_SEEN_CACHE);
  sessionStorage.setItem(SESSION_SEEN_KEY, JSON.stringify(seenArray));
}

// Global per-user seen cache
const seenPerUser = new Map();

export function resetSeenIds(userId) {
  if (userId) {
    seenPerUser.delete(userId);
  } else {
    seenPerUser.clear();
  }
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(SESSION_SEEN_KEY);
  }
}

function markItemAsSeen(userId, itemId) {
  if (!userId || !itemId) return;
  if (!seenPerUser.has(userId)) {
    seenPerUser.set(userId, getSessionSeen());
  }
  const userSeen = seenPerUser.get(userId);
  userSeen.add(itemId);
  saveSessionSeen(userSeen);
}

function isItemSeen(userId, itemId) {
  if (!userId) return false;
  if (!seenPerUser.has(userId)) {
    seenPerUser.set(userId, getSessionSeen());
  }
  return seenPerUser.get(userId)?.has(itemId) ?? false;
}

// ----- Last session continuation (improvement #4) -----
const LAST_SESSION_KEY = 'feed_last_session';

function getLastSession() {
  if (typeof window === 'undefined') return null;
  const cached = localStorage.getItem(LAST_SESSION_KEY);
  if (!cached) return null;
  const data = JSON.parse(cached);
  // Only use if < 24 hours old
  if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) {
    localStorage.removeItem(LAST_SESSION_KEY);
    return null;
  }
  return data;
}

function saveLastSession(cursor, contentTypes) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LAST_SESSION_KEY, JSON.stringify({
    cursor,
    contentTypes,
    timestamp: Date.now()
  }));
}

// ----- normalisation helpers -----
function normalizeItem(item) {
  if (!item || typeof item !== 'object') return null;

  const itemId = item.item_id ?? item.id ?? item.original_id ?? null;
  if (!itemId) return null;

  return {
    item_id: itemId,
    item_type: item.item_type ?? item.content_type ?? 'post',
    title: item.title ?? '',
    summary: item.summary ?? '',
    author_id: item.author_id ?? null,
    author_name: item.author_name ?? 'Anonymous',
    created_at: item.created_at ?? null,
    likes: Number(item.likes ?? 0),
    replies: Number(item.replies ?? 0),
    engagement_score: Number(item.engagement_score ?? 0),
    content_type: item.content_type ?? item.item_type ?? 'blog',
    original_id: item.original_id ?? item.id ?? itemId,
    personalized_score: Number(item.personalized_score ?? item.score ?? 0),
    tags: item.tags ?? [],
    slug: item.slug ?? null,
  };
}

function dedupeItems(items) {
  const seen = new Set();
  const result = [];
  for (const item of items) {
    if (!item?.item_id) continue;
    if (seen.has(item.item_id)) continue;
    seen.add(item.item_id);
    result.push(item);
  }
  return result;
}

function sortItems(items) {
  return [...items].sort((a, b) => {
    const scoreDiff = (b.personalized_score ?? 0) - (a.personalized_score ?? 0);
    if (scoreDiff !== 0) return scoreDiff;
    const dateDiff = (b.created_at ?? '').localeCompare(a.created_at ?? '');
    if (dateDiff !== 0) return dateDiff;
    return (a.item_id ?? '').localeCompare(b.item_id ?? '');
  });
}

function getNextCursor(items) {
  if (!items || items.length === 0) return null;
  const last = items[items.length - 1];
  if (!last?.item_id || last?.personalized_score === undefined) return null;
  return {
    score: last.personalized_score,
    id: last.item_id,
  };
}

// ----- MAIN FEED FETCHER (now uses V8) -----
export async function fetchPersonalizedFeed({
  userId,
  limit = 20,
  cursorScore = Number.POSITIVE_INFINITY,
  cursorId = null,
  contentType = null,
  signal = null,
  retries = 1,
  isInitialLoad = false,
}) {
  if (!userId) {
    return { items: [], nextCursor: null };
  }

  // IMPROVEMENT #4: Continue from last session on initial load
  if (isInitialLoad && cursorId === null) {
    const lastSession = getLastSession();
    if (lastSession?.cursor) {
      cursorScore = lastSession.cursor.score;
      cursorId = lastSession.cursor.id;
    }
  }

  try {
    const { data, error } = await supabase.rpc(
      'get_personalized_feed_v8',
      {
        p_user_id: userId,
        p_limit: limit,
        p_cursor_score: cursorScore,
        p_cursor_id: cursorId,
        p_content_type: contentType,
      },
      { signal }
    );

    if (error) {
      if (retries > 0) {
        return fetchPersonalizedFeed({
          userId,
          limit,
          cursorScore,
          cursorId,
          contentType,
          signal,
          retries: retries - 1,
          isInitialLoad: false,
        });
      }
      throw error;
    }

    if (!Array.isArray(data)) {
      return { items: [], nextCursor: null };
    }

    // Empty page fallback
    if (data.length === 0 && cursorId !== null && retries > 0) {
      return fetchPersonalizedFeed({
        userId,
        limit,
        cursorScore: Number.POSITIVE_INFINITY,
        cursorId: null,
        contentType,
        signal,
        retries: retries - 1,
        isInitialLoad: false,
      });
    }

    // Normalize and dedupe (ranking is authoritative from backend)
    const normalized = data.map(normalizeItem).filter(Boolean);
    let items = dedupeItems(normalized);
    // REMOVED client-side sortItems call to preserve backend ranking

    // Cross-page deduplication
    const uniqueItems = [];
    for (const item of items) {
      if (!isItemSeen(userId, item.item_id)) {
        markItemAsSeen(userId, item.item_id);
        uniqueItems.push(item);
      }
    }
    items = uniqueItems;

    const nextCursor = getNextCursor(items);
    
    // Save session for continuation
    if (items.length > 0) {
      const contentTypes = items.reduce((acc, item) => {
        const type = item.content_type || 'blog';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
      saveLastSession(nextCursor, contentTypes);
    }

    return { items, nextCursor };
  } catch (err) {
    if (err?.name === 'AbortError') {
      return { items: [], nextCursor: null };
    }
    console.error('FeedClient Error:', err?.message || err);
    return { items: [], nextCursor: null };
  }
}

/**
 * Consolidated Engagement Tracking (V3)
 */
export async function trackEngagementBatch(events) {
  if (!events || events.length === 0) return;
  try {
    const { error } = await supabase.rpc('batch_record_engagement_v3', { events });
    if (error) throw error;
  } catch (err) {
    console.warn('Engagement Batch Sync Failed:', err.message);
  }
}