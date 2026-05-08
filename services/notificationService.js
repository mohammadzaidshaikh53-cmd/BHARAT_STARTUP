// services/notificationService.js — Real-time notification service
import { supabase } from '@/lib/supabase';

/**
 * Fetch all notifications for a user
 */
export async function getNotifications(userId) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[notificationService.getNotifications]', err);
    return [];
  }
}

/**
 * Mark a specific notification as read
 */
export async function markAsRead(notificationId) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('[notificationService.markAsRead]', err);
    return { success: false, error: err.message };
  }
}

/**
 * Subscribe to real-time notifications for a user
 */
export function subscribeToNotifications(userId, callback) {
  if (!userId) return null;

  return supabase
    .channel(`user-notifications-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();
}

/**
 * Create a new notification (internal use, usually triggered via DB function or edge function)
 */
export async function createNotification({ user_id, title, message, type = 'info', link = null }) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        user_id,
        title,
        message,
        type,
        link,
        is_read: false,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('[notificationService.createNotification]', err);
    return { success: false, error: err.message };
  }
}
