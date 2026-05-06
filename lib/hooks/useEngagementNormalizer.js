import { useCallback } from 'react';

export function useEngagementNormalizer() {
  const normalize = useCallback((event) => {
    const normalized = {
      user_id: event.user_id,
      post_id: event.post_id,
      event_type: event.event_type,
      metadata: event.metadata || {},
      created_at: new Date().toISOString(),
    };
    // compress metadata by removing large or redundant fields
    if (normalized.metadata.url) {
      normalized.metadata.url = normalized.metadata.url.split('?')[0]; // strip query params
    }
    return normalized;
  }, []);

  return normalize;
}