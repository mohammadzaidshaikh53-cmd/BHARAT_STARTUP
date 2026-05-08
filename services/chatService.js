/**
 * Chat Service
 * Pattern from: Discord, Slack, Linear
 *
 * Provides:
 * - Room management
 * - Message sending/receiving
 * - Read receipts
 * - Typing indicators
 * - File attachments
 */

import { createClient } from '@/lib/supabase';
import { queryKeys } from '@/lib/query/queryKeys';

const supabase = createClient();

/**
 * Get all chat rooms for a user
 */
export async function getChatRooms(userId) {
  const { data, error } = await supabase
    .from('chat_rooms')
    .select(`
      *,
      participants:chat_room_participants(
        user:users(id, full_name, avatar_url, email)
      ),
      last_message:chat_messages(content, created_at, sender_id)
    `)
    .contains('participant_ids', [userId])
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get or create a chat room between users
 */
export async function getOrCreateRoom(userId, otherUserId) {
  const { data: existing } = await supabase
    .from('chat_rooms')
    .select('*')
    .contains('participant_ids', [userId, otherUserId])
    .single();

  if (existing) return existing;

  const { data, error } = await supabase
    .from('chat_rooms')
    .insert({
      participant_ids: [userId, otherUserId],
      type: 'direct',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get messages for a room with pagination
 */
export async function getMessages(roomId, { limit = 50, cursor = null } = {}) {
  let query = supabase
    .from('chat_messages')
    .select(`
      *,
      sender:users(id, full_name, avatar_url),
      attachments:chat_attachments(*)
    `)
    .eq('room_id', roomId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data?.reverse() || [];
}

/**
 * Send a message
 */
export async function sendMessage(roomId, senderId, content, attachments = []) {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      room_id: roomId,
      sender_id: senderId,
      content,
      attachments,
    })
    .select(`
      *,
      sender:users(id, full_name, avatar_url)
    `)
    .single();

  if (error) throw error;

  // Update room's updated_at
  await supabase
    .from('chat_rooms')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', roomId);

  return data;
}

/**
 * Mark messages as read
 */
export async function markMessagesRead(roomId, userId, lastReadMessageId) {
  const { error } = await supabase
    .from('chat_read_receipts')
    .upsert({
      room_id: roomId,
      user_id: userId,
      last_read_message_id: lastReadMessageId,
      read_at: new Date().toISOString(),
    });

  if (error) console.error('Failed to mark read:', error);
}

/**
 * Get unread count per room
 */
export async function getUnreadCounts(userId) {
  const { data, error } = await supabase
    .from('chat_read_receipts')
    .select('room_id, last_read_message_id, read_at')
    .eq('user_id', userId);

  if (error) throw error;

  // Get rooms
  const { data: rooms } = await supabase
    .from('chat_rooms')
    .select('id, last_message_id')
    .contains('participant_ids', [userId]);

  if (!rooms) return {};

  // Calculate unread per room
  const counts = {};
  for (const room of rooms) {
    const receipt = data?.find((r) => r.room_id === room.id);
    if (!receipt) {
      counts[room.id] = 0;
      continue;
    }

    const { count } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', room.id)
      .gt('created_at', receipt.read_at);

    counts[room.id] = count;
  }

  return counts;
}

/**
 * Create a group chat room
 */
export async function createGroupRoom(userId, participantIds, name, type = 'group') {
  const allParticipants = [...new Set([userId, ...participantIds])];

  const { data, error } = await supabase
    .from('chat_rooms')
    .insert({
      participant_ids: allParticipants,
      type,
      name,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Add participants to a room
 */
export async function addParticipants(roomId, participantIds) {
  const { data: room } = await supabase
    .from('chat_rooms')
    .select('participant_ids')
    .eq('id', roomId)
    .single();

  if (!room) throw new Error('Room not found');

  const updated = [...new Set([...room.participant_ids, ...participantIds])];

  const { error } = await supabase
    .from('chat_rooms')
    .update({ participant_ids: updated })
    .eq('id', roomId);

  if (error) throw error;
}

/**
 * Leave a chat room
 */
export async function leaveRoom(roomId, userId) {
  const { data: room } = await supabase
    .from('chat_rooms')
    .select('participant_ids')
    .eq('id', roomId)
    .single();

  if (!room) throw new Error('Room not found');

  const updated = room.participant_ids.filter((id) => id !== userId);

  if (updated.length === 0) {
    // Delete room if no participants left
    await supabase.from('chat_rooms').delete().eq('id', roomId);
  } else {
    await supabase
      .from('chat_rooms')
      .update({ participant_ids: updated })
      .eq('id', roomId);
  }
}

/**
 * Upload chat attachment
 */
export async function uploadAttachment(roomId, file, userId) {
  const ext = file.name.split('.').pop();
  const path = `chat/${roomId}/${userId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('attachments')
    .upload(path, file);

  if (uploadError) throw uploadError;

  const { data: urlData } = await supabase.storage
    .from('attachments')
    .createSignedUrl(path, 60 * 60 * 24); // 24 hours

  return {
    name: file.name,
    url: urlData.signedUrl,
    path,
    type: file.type,
    size: file.size,
  };
}

/**
 * Get online status for users
 */
export async function getOnlineUsers(userIds) {
  // This would typically use a presence channel
  // For now, return all as offline
  return userIds.reduce((acc, id) => ({ ...acc, [id]: false }), {});
}
