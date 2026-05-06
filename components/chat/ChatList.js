// components/chat/ChatList.js
'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Avatar } from '@/components/common/Avatar';
import { cn } from '@/lib/utils';

const getRelativeTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// -----------------------------------------------------------------------------
// SCHEMA DETECTION
// -----------------------------------------------------------------------------
async function checkTableExists(tableName) {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })
      .limit(1);
    
    if (!error) return { exists: true };
    
    const isMissing = error.message?.includes('does not exist') || 
                      error.message?.includes('relation') ||
                      error.code === '42P01';
    
    return { exists: !isMissing, error: isMissing ? null : error };
  } catch (e) {
    return { exists: false, error: e };
  }
}

// -----------------------------------------------------------------------------
// NEW CHAT MODAL (inline for self‑contained component)
// -----------------------------------------------------------------------------
function NewChatModal({ isOpen, onClose, currentUserId, onChatCreated }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!isOpen || !searchTerm.trim()) {
      setUsers([]);
      return;
    }

    const fetchUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('id, raw_user_meta_data, email')
        .ilike('raw_user_meta_data->>full_name', `%${searchTerm}%`)
        .neq('id', currentUserId)
        .limit(10);
      if (!error) setUsers(data || []);
      setLoading(false);
    };
    const timeout = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm, currentUserId, isOpen]);

  const startChat = async (otherUserId) => {
    setCreating(true);
    try {
      // Fetch rooms where both users are participants (direct chat)
      const { data: myRooms, error: myRoomsErr } = await supabase
        .from('chat_participants')
        .select('room_id')
        .eq('user_id', currentUserId);
      if (myRoomsErr) throw myRoomsErr;
      const myRoomIds = myRooms.map(p => p.room_id);
      
      if (myRoomIds.length > 0) {
        const { data: otherParticipant, error: otherErr } = await supabase
          .from('chat_participants')
          .select('room_id')
          .eq('user_id', otherUserId)
          .in('room_id', myRoomIds);
        if (!otherErr && otherParticipant && otherParticipant.length > 0) {
          // Existing room found
          onChatCreated(otherParticipant[0].room_id);
          onClose();
          return;
        }
      }

      // Create new direct chat room (is_group = false)
      const { data: newRoom, error: roomError } = await supabase
        .from('chat_rooms')
        .insert({ is_group: false })
        .select()
        .single();
      if (roomError) throw roomError;
      
      // Add both participants
      await supabase.from('chat_participants').insert([
        { room_id: newRoom.id, user_id: currentUserId },
        { room_id: newRoom.id, user_id: otherUserId }
      ]);
      
      onChatCreated(newRoom.id);
      onClose();
    } catch (err) {
      console.error('Failed to start chat:', err);
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-5 shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">New Chat</h3>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="relative mb-4">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-white/[0.03] text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30"
            autoFocus
          />
        </div>

        <div className="max-h-60 overflow-y-auto space-y-2">
          {loading && (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {!loading && users.length === 0 && searchTerm && (
            <div className="text-center py-6 text-gray-500 text-sm">No users found</div>
          )}
          {users.map(user => {
            const name = user.raw_user_meta_data?.full_name || user.email?.split('@')[0] || 'User';
            return (
              <button
                key={user.id}
                onClick={() => startChat(user.id)}
                disabled={creating}
                className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors text-left"
              >
                <Avatar name={name} size={40} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------------
export function ChatList({ onSelectRoom, selectedRoomId, currentUserId }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [schemaReady, setSchemaReady] = useState(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  
  const debounceRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  // Schema check on mount
  useEffect(() => {
    let cancelled = false;
    
    async function validateSchema() {
      const tables = ['chat_participants', 'chat_rooms', 'chat_messages'];
      const results = await Promise.all(tables.map(t => checkTableExists(t)));
      
      if (cancelled) return;
      
      const allExist = results.every(r => r.exists);
      setSchemaReady(allExist);
      
      if (!allExist) {
        const missing = tables.filter((_, i) => !results[i].exists);
        console.error('[ChatList] Missing tables:', missing);
        setError(`Chat tables not found: ${missing.join(', ')}. Run the SQL migration.`);
        setLoading(false);
      }
    }
    
    validateSchema();
    return () => { cancelled = true; };
  }, []);

  const getRoomName = useCallback((room) => {
    if (!room) return 'Unknown';
    if (room.is_group) return room.name || 'Group Chat';
    return 'Private Chat';
  }, []);

  const fetchRooms = useCallback(async () => {
    if (!schemaReady || !currentUserId) {
      if (isMountedRef.current) setLoading(false);
      return;
    }

    if (isMountedRef.current) {
      setLoading(true);
      setError(null);
    }

    try {
      // 1. Get participant room IDs
      const { data: participants, error: pErr } = await supabase
        .from('chat_participants')
        .select('room_id')
        .eq('user_id', currentUserId);

      if (pErr) {
        const isRLSRecursion = pErr.message?.includes('infinite recursion') ||
                               pErr.message?.includes('recursion detected');
        if (isRLSRecursion) {
          throw new Error('Database policy error: infinite recursion in chat_participants. Please fix RLS policies.');
        }
        throw pErr;
      }
      
      const roomIds = participants?.map(p => p.room_id).filter(Boolean) || [];
      
      if (roomIds.length === 0) {
        if (isMountedRef.current) {
          setRooms([]);
          setLoading(false);
        }
        return;
      }

      // 2. Fetch rooms
      const { data: roomsData, error: rErr } = await supabase
        .from('chat_rooms')
        .select('id, name, is_group')
        .in('id', roomIds);

      if (rErr) throw rErr;
      
      if (!roomsData?.length) {
        if (isMountedRef.current) {
          setRooms([]);
          setLoading(false);
        }
        return;
      }

      // 3. Last messages
      let lastMessages = {};
      try {
        const { data: messages } = await supabase
          .from('chat_messages')
          .select('room_id, content, created_at')
          .in('room_id', roomIds)
          .order('created_at', { ascending: false });
        
        if (messages) {
          const seen = new Set();
          for (const m of messages) {
            if (!seen.has(m.room_id)) {
              seen.add(m.room_id);
              lastMessages[m.room_id] = { content: m.content, created_at: m.created_at };
            }
          }
        }
      } catch (e) {
        console.warn('[ChatList] Last messages fetch failed:', e);
      }

      // 4. Unread counts
      let unreadMap = new Map();
      try {
        const { data: unreads } = await supabase
          .from('chat_unreads')
          .select('room_id, unread_count')
          .eq('user_id', currentUserId);
        
        if (unreads) {
          unreads.forEach(u => unreadMap.set(u.room_id, u.unread_count || 0));
        }
      } catch (e) {
        // Table may not exist
      }

      // 5. Enrich & sort
      const enriched = roomsData.map(room => ({
        ...room,
        displayName: getRoomName(room),
        unreadCount: unreadMap.get(room.id) || 0,
        last_message: lastMessages[room.id]?.content || 'No messages yet',
        last_message_at: lastMessages[room.id]?.created_at || null,
      }));

      const sorted = enriched.sort((a, b) =>
        new Date(b.last_message_at || 0) - new Date(a.last_message_at || 0)
      );

      if (isMountedRef.current) setRooms(sorted);
    } catch (err) {
      console.error('[ChatList] fetchRooms error:', err);
      
      if (isMountedRef.current) {
        setError(err?.message || 'Failed to load conversations');
      }
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [schemaReady, currentUserId, getRoomName]);

  useEffect(() => {
    if (schemaReady === true && currentUserId) {
      fetchRooms();
    }
  }, [schemaReady, currentUserId, fetchRooms]);

  // Realtime
  useEffect(() => {
    if (!schemaReady || !currentUserId) return;

    const channel = supabase
      .channel(`chat-list-${currentUserId}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        () => {
          if (debounceRef.current) clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(fetchRooms, 300);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [schemaReady, currentUserId, fetchRooms]);

  const filteredRooms = useMemo(() => {
    if (!searchTerm.trim()) return rooms;
    const term = searchTerm.toLowerCase();
    return rooms.filter(r => r.displayName.toLowerCase().includes(term));
  }, [rooms, searchTerm]);

  // ─── RENDER STATES ─────────────────────────────────────────────

  if (schemaReady === null) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm text-gray-500">Checking chat system...</p>
      </div>
    );
  }

  if (schemaReady === false) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Chat Not Configured</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[240px] leading-relaxed mb-4">
          {error}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  if (!currentUserId) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Sign In Required</h3>
        <p className="text-xs text-gray-500">Log in to view your conversations</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-3 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="h-10 bg-gray-100 dark:bg-white/5 rounded-xl animate-pulse" />
        </div>
        <div className="flex-1 px-3 py-2 space-y-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] animate-pulse">
              <div className="w-11 h-11 bg-gray-200 dark:bg-white/10 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-white/10 rounded-lg w-2/3" />
                <div className="h-3 bg-gray-200 dark:bg-white/10 rounded-lg w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Failed to Load</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[260px] mb-4">{error}</p>
        <button 
          onClick={fetchRooms}
          className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Main content with New Chat button
  return (
    <>
      <div className="flex flex-col h-full bg-white dark:bg-[#0a0a0a]">
        {/* Search with New Chat button */}
        <div className="p-3 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-xl pl-9 pr-10 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all"
            />
            <button 
              onClick={() => setShowNewChatModal(true)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 transition-colors"
              aria-label="New chat"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Room List */}
        <div className="flex-1 overflow-y-auto">
          {filteredRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
                {searchTerm ? (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                )}
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                {searchTerm ? `No results for "${searchTerm}"` : 'No conversations yet'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px]">
                {searchTerm ? 'Try a different search term' : 'Start a conversation to see it here'}
              </p>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="mt-3 text-xs text-orange-600 dark:text-orange-400 font-medium hover:underline"
                >
                  Clear search
                </button>
              )}
              {!searchTerm && rooms.length === 0 && (
                <button 
                  onClick={() => setShowNewChatModal(true)}
                  className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-semibold hover:bg-orange-700 transition-colors"
                >
                  New Chat
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-white/[0.04]">
              {filteredRooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => onSelectRoom(room.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150',
                    selectedRoomId === room.id 
                      ? 'bg-orange-50/60 dark:bg-orange-500/[0.04]' 
                      : 'hover:bg-gray-50 dark:hover:bg-white/[0.02]'
                  )}
                >
                  <Avatar name={room.displayName} size={42} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={cn(
                        'text-[13px] font-semibold truncate',
                        selectedRoomId === room.id ? 'text-orange-900 dark:text-orange-100' : 'text-gray-900 dark:text-white'
                      )}>
                        {room.displayName}
                      </h3>
                      {room.last_message_at && (
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 whitespace-nowrap flex-shrink-0">
                          {getRelativeTime(room.last_message_at)}
                        </span>
                      )}
                    </div>
                    
                    <p className={cn(
                      'text-[13px] truncate mt-0.5 leading-snug',
                      room.unreadCount > 0 
                        ? 'text-gray-900 dark:text-gray-200 font-medium' 
                        : 'text-gray-500 dark:text-gray-500'
                    )}>
                      {room.last_message || 'No messages yet'}
                    </p>
                  </div>

                  {room.unreadCount > 0 && (
                    <span className="flex-shrink-0 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-bold rounded-full">
                      {room.unreadCount > 99 ? '99+' : room.unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        currentUserId={currentUserId}
        onChatCreated={(newRoomId) => {
          onSelectRoom(newRoomId);
          fetchRooms(); // refresh list
        }}
      />
    </>
  );
}