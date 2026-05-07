'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Avatar } from '@/components/common/Avatar';
import { toast } from 'sonner';
import {
  X,
  Search,
  UserPlus,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SEARCH_DEBOUNCE_MS = 300;
const MAX_SEARCH_RESULTS = 10;
const MAX_ROOM_CHECK_LIMIT = 5;

const ANIMATION_CONFIG = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 },
  transition: { type: 'spring', damping: 25, stiffness: 400 },
};

export function NewChatModal({
  isOpen,
  onClose,
  currentUserId,
  onChatCreated,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const searchTimeoutRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => e.key === 'Escape' && onClose();
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleOutsideClick);
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.removeEventListener('mousedown', handleOutsideClick);
      };
    }
  }, [isOpen, onClose]);

  const debouncedSearch = useCallback(
    (term) => {
      if (!term.trim() || !currentUserId) {
        setUsers([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      supabase
        .from('profiles')
        .select('id, full_name, avatar_url, username')
        .or(`full_name.ilike.%${term}%,username.ilike.%${term}%`)
        .neq('id', currentUserId)
        .limit(MAX_SEARCH_RESULTS)
        .then(({ data, error }) => {
          if (error) {
            console.error('Search error:', error);
            toast.error('Failed to search users');
            setUsers([]);
          } else {
            setUsers(data || []);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error('Search failed:', err);
          toast.error('Search failed');
          setUsers([]);
          setLoading(false);
        });
    },
    [currentUserId]
  );

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(() => {
      debouncedSearch(searchTerm);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchTerm, debouncedSearch]);

  const processedUsers = useMemo(
    () =>
      users.map((profile) => ({
        ...profile,
        displayName: profile.full_name || profile.username || 'User',
        userInfo: {
          avatar: profile.avatar_url || null,
          email: profile.username || '',
        },
      })),
    [users]
  );

  const startChat = useCallback(
    async (otherUserId) => {
      if (creating || !otherUserId || !currentUserId) return;

      setCreating(true);
      setSelectedUser(otherUserId);

      try {
        const { data: myRooms, error: myRoomsError } = await supabase
          .from('chat_participants')
          .select('room_id')
          .eq('user_id', currentUserId);

        if (myRoomsError) throw myRoomsError;

        if (myRooms?.length) {
          const { data: otherUserRooms, error: otherRoomsError } = await supabase
            .from('chat_participants')
            .select('room_id')
            .eq('user_id', otherUserId);

          if (otherRoomsError) throw otherRoomsError;

          if (otherUserRooms?.length) {
            const myRoomIds = myRooms.map((r) => r.room_id);
            const commonRoomIds = otherUserRooms
              .map((r) => r.room_id)
              .filter((roomId) => myRoomIds.includes(roomId))
              .slice(0, MAX_ROOM_CHECK_LIMIT);

            for (const roomId of commonRoomIds) {
              const { count, error: countError } = await supabase
                .from('chat_participants')
                .select('*', { count: 'exact', head: true })
                .eq('room_id', roomId);

              if (countError) throw countError;

              if (count === 2) {
                toast.success('Opened existing chat');
                onChatCreated(roomId);
                onClose();
                return;
              }
            }
          }
        }

        const otherUser = users.find((u) => u.id === otherUserId);
        const otherUserName =
          otherUser?.full_name || otherUser?.username || 'User';

        const { data: newRoom, error: roomError } = await supabase
          .from('chat_rooms')
          .insert({
            is_group: false,
            name: `Chat with ${otherUserName}`,
            created_by: currentUserId,
          })
          .select()
          .single();

        if (roomError) throw roomError;

        const { error: participantsError } = await supabase
          .from('chat_participants')
          .insert([
            { room_id: newRoom.id, user_id: currentUserId },
            { room_id: newRoom.id, user_id: otherUserId },
          ]);

        if (participantsError) throw participantsError;

        toast.success('New chat created!');
        onChatCreated(newRoom.id);
        onClose();
      } catch (error) {
        console.error('Chat creation failed:', error);
        toast.error(error.message || 'Failed to create chat');
      } finally {
        setCreating(false);
        setSelectedUser(null);
      }
    },
    [creating, currentUserId, users, onChatCreated, onClose]
  );

  const handleClose = useCallback(() => {
    setSearchTerm('');
    setUsers([]);
    setSelectedUser(null);
    onClose();
  }, [onClose]);

  const hasResults = processedUsers.length > 0;
  const showNoResults = !loading && searchTerm.trim() && !hasResults;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            ref={modalRef}
            className={cn(
              'w-full max-w-sm max-h-[90vh] flex flex-col shadow-2xl border border-gray-200/50 dark:border-gray-700/50',
              'bg-white dark:bg-gray-900 rounded-3xl overflow-hidden',
              creating && 'pointer-events-none'
            )}
            initial={ANIMATION_CONFIG.initial}
            animate={ANIMATION_CONFIG.animate}
            exit={ANIMATION_CONFIG.exit}
            transition={ANIMATION_CONFIG.transition}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-500/20 rounded-xl">
                  <UserPlus className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                    New Chat
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Start 1:1 messaging
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 0.95 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className="p-2 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all disabled:opacity-50"
                disabled={creating}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="flex-1 min-h-0 flex flex-col p-6 pt-4">
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={cn(
                    'w-full pl-11 pr-4 py-3 rounded-2xl border-2 bg-white/50 dark:bg-gray-800/50 disabled:cursor-not-allowed',
                    'focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10',
                    'dark:border-gray-700 dark:focus:border-orange-400 dark:placeholder-gray-500',
                    'transition-all duration-200 placeholder-gray-500 shadow-sm'
                  )}
                  disabled={creating}
                  autoFocus
                />
                {loading && !creating && (
                  <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                )}
              </div>

              <div className="flex-1 min-h-0 space-y-2 overflow-y-auto">
                {showNoResults && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12 text-gray-500 dark:text-gray-400"
                  >
                    <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">No users found</p>
                    <p className="text-xs mt-1">Try a different name or username</p>
                  </motion.div>
                )}

                <AnimatePresence>
                  {hasResults &&
                    processedUsers.map((user) => (
                      <motion.button
                        key={user.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        whileHover={{
                          scale: 1.02,
                          backgroundColor: creating ? undefined : '#fef3c7',
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => startChat(user.id)}
                        disabled={creating}
                        className={cn(
                          'group w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200',
                          'border-transparent hover:border-orange-200 dark:hover:border-orange-900/50',
                          'hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none',
                          creating && 'pointer-events-none'
                        )}
                      >
                        <Avatar
                          name={user.displayName}
                          src={user.userInfo.avatar}
                          size={44}
                          className="flex-shrink-0 ring-2 ring-transparent group-hover:ring-orange-200"
                        />
                        <div className="flex-1 min-w-0 text-left">
                          <p className="font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 truncate">
                            {user.displayName}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {user.userInfo.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <motion.div
                            className={cn(
                              'w-2.5 h-2.5 rounded-full transition-all duration-200',
                              creating && selectedUser === user.id
                                ? 'bg-orange-500 shadow-sm animate-pulse'
                                : 'bg-gray-300 group-hover:bg-orange-400 dark:bg-gray-600 dark:group-hover:bg-orange-400'
                            )}
                            animate={creating && selectedUser === user.id ? { scale: [1, 1.2, 1] } : {}}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
                        </div>
                      </motion.button>
                    ))}
                </AnimatePresence>
              </div>
            </div>

            {creating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/90 dark:bg-black/60 backdrop-blur-md flex items-center justify-center rounded-3xl border-4 border-orange-100 dark:border-orange-900/50"
              >
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-orange-100 dark:bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    Creating your chat...
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Finding or making the perfect 1:1 chat
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}