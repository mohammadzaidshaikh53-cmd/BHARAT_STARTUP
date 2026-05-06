// components/panels/GroupInfoPanel.js
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import {
  XMarkIcon,
  UserPlusIcon,
  UserMinusIcon,
  ShieldCheckIcon,
  UserIcon,
  LinkIcon,
  ClipboardDocumentIcon,
  TrashIcon,
  ArrowLeftStartOnRectangleIcon,
  CheckIcon,
  ExclamationCircleIcon,
  FlagIcon,
} from '@heroicons/react/24/outline';

const slideFromRight = {
  hidden: { x: 320, opacity: 0 },
  visible: { x: 0, opacity: 1 },
  exit: { x: 320, opacity: 0 },
};

export function GroupInfoPanel({ roomId, onClose, onRoomRemoved, currentUserId }) {
  const router = useRouter();
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [inviteCode, setInviteCode] = useState(null);
  const [inviteExpiry, setInviteExpiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [generatingInvite, setGeneratingInvite] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [removingId, setRemovingId] = useState(null);
  const [updatingRoleId, setUpdatingRoleId] = useState(null);
  const [leaving, setLeaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const [inviteError, setInviteError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  
  const [reportModal, setReportModal] = useState({ open: false, targetUserId: null, targetName: null });
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting] = useState(false);
  
  const debounceRef = useRef(null);
  const abortControllerRef = useRef(null);

  // ---------------------------------------------------------------------------
  // Fetch room details & participants (FIXED: no nested join)
  // ---------------------------------------------------------------------------
  const fetchData = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    try {
      setError(null);
      setLoading(true);

      // 1. Room details
      const { data: roomData, error: roomError } = await supabase
        .from('chat_rooms')
        .select('*, product:product_id(name)', { signal })
        .eq('id', roomId)
        .single();
      if (roomError) throw roomError;
      setRoom(roomData);

      // 2. Fetch participants (only user_id and role) – NO NESTED JOIN
      const { data: participantsData, error: partsError } = await supabase
        .from('chat_participants')
        .select('user_id, role', { signal })
        .eq('room_id', roomId);
      if (partsError) throw partsError;

      if (!participantsData || !Array.isArray(participantsData)) {
        console.error('Participants invalid:', participantsData);
        throw new Error('Invalid participants data');
      }

      // 3. Fetch user details from public.users view (created via SQL)
      const userIds = participantsData.map(p => p.user_id).filter(Boolean);
      let userMap = new Map();
      if (userIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, email, raw_user_meta_data', { signal })
          .in('id', userIds);
        if (usersError) {
          console.warn('Failed to fetch users:', usersError);
        } else {
          usersData?.forEach(user => userMap.set(user.id, user));
        }
      }

      // Enrich participants
      const enriched = participantsData.map(p => {
        const user = userMap.get(p.user_id);
        const name = user?.raw_user_meta_data?.full_name
                  || user?.email?.split('@')[0]
                  || p.user_id?.slice(0, 8)
                  || 'User';
        return {
          ...p,
          user,
          name,
        };
      });

      setParticipants(enriched);
      const currentParticipant = enriched.find(p => p.user_id === currentUserId);
      setIsAdmin(currentParticipant?.role === 'admin');

      // 4. Invite
      const { data: inviteData, error: inviteError } = await supabase
        .from('group_invites')
        .select('invite_code, expires_at', { signal })
        .eq('room_id', roomId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (inviteError) throw inviteError;
      if (inviteData) {
        setInviteCode(inviteData.invite_code);
        setInviteExpiry(inviteData.expires_at);
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('REAL ERROR:', err);
      console.error('Stringified error:', JSON.stringify(err, null, 2));
      setError(err.message || 'Failed to load room info');
    } finally {
      setLoading(false);
    }
  }, [roomId, currentUserId]);

  // ---------------------------------------------------------------------------
  // Realtime (unchanged)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel(`room-${roomId}-participants`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_participants', filter: `room_id=eq.${roomId}` }, (payload) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          if (payload.eventType === 'DELETE') {
            setParticipants(prev => prev.filter(p => p.user_id !== payload.old.user_id));
          } else {
            fetchData();
          }
        }, 200);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [roomId, fetchData]);

  // ---------------------------------------------------------------------------
  // Invite (unchanged)
  // ---------------------------------------------------------------------------
  const generateInvite = async () => {
    if (!isAdmin) return;
    setGeneratingInvite(true);
    setInviteError(null);
    try {
      const { data: code, error } = await supabase.rpc('create_group_invite', {
        p_room_id: roomId,
        p_valid_for: '7 days',
      });
      if (error) throw error;
      setInviteCode(code);
      setInviteExpiry(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());
    } catch (err) {
      console.error('Generate invite error:', err);
      setInviteError(err.message);
    } finally {
      setGeneratingInvite(false);
    }
  };

  const copyInviteLink = async () => {
    const fullLink = `${window.location.origin}/invite/${inviteCode}`;
    try {
      await navigator.clipboard.writeText(fullLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Clipboard error:', err);
      setInviteError('Failed to copy link. Please copy manually.');
    }
  };

  // ---------------------------------------------------------------------------
  // Admin actions (unchanged)
  // ---------------------------------------------------------------------------
  const updateRole = async (userId, newRole) => {
    if (!isAdmin || userId === currentUserId) return;
    setUpdatingRoleId(userId);
    setActionError(null);

    setParticipants(prev => prev.map(p => 
      p.user_id === userId ? { ...p, role: newRole } : p
    ));

    try {
      const { error } = await supabase
        .from('chat_participants')
        .update({ role: newRole })
        .eq('room_id', roomId)
        .eq('user_id', userId);
      if (error) throw error;
    } catch (err) {
      console.error('Role update error:', err);
      setActionError(`Failed to update role: ${err.message}`);
      fetchData();
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const removeParticipant = async (userId) => {
    if (!isAdmin || userId === currentUserId) return;
    setRemovingId(userId);
    setActionError(null);

    setParticipants(prev => prev.filter(p => p.user_id !== userId));

    try {
      const { error } = await supabase
        .from('chat_participants')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', userId);
      if (error) throw error;
    } catch (err) {
      console.error('Remove error:', err);
      setActionError(`Failed to remove: ${err.message}`);
      fetchData();
    } finally {
      setRemovingId(null);
      setConfirmAction(null);
    }
  };

  // ---------------------------------------------------------------------------
  // Leave / Delete (unchanged)
  // ---------------------------------------------------------------------------
  const leaveGroup = async () => {
    setLeaving(true);
    setActionError(null);
    try {
      const { error } = await supabase
        .from('chat_participants')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', currentUserId);
      if (error) throw error;
      
      onRoomRemoved?.();
      onClose?.();
      router.push('/chat');
    } catch (err) {
      console.error('Leave error:', err);
      setActionError(`Failed to leave: ${err.message}`);
    } finally {
      setLeaving(false);
      setConfirmAction(null);
    }
  };

  const deleteGroup = async () => {
    if (!isAdmin) return;
    setDeleting(true);
    setActionError(null);
    try {
      const { error } = await supabase
        .from('chat_rooms')
        .delete()
        .eq('id', roomId);
      if (error) throw error;
      
      onRoomRemoved?.();
      onClose?.();
      router.push('/chat');
    } catch (err) {
      console.error('Delete error:', err);
      setActionError(`Failed to delete: ${err.message}`);
    } finally {
      setDeleting(false);
      setConfirmAction(null);
    }
  };

  const submitReport = async () => {
    if (!reportReason.trim()) return;

    setReporting(true);

    try {
      const { error } = await supabase
        .from('chat_reports')
        .insert({
          reporter_id: currentUserId,
          room_id: reportModal.targetUserId ? null : roomId,
          reported_user_id: reportModal.targetUserId || null,
          reason: reportReason,
        });

      if (error) throw error;

      alert('Report submitted. Thank you for helping keep our community safe.');

      setReportModal({ open: false, targetUserId: null, targetName: null });
      setReportReason('');

    } catch (err) {
      console.error('Report error:', err);
      alert('Failed to submit report. Please try again.');
    } finally {
      setReporting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Confirmation modal (unchanged)
  // ---------------------------------------------------------------------------
  const renderConfirm = () => {
    if (!confirmAction) return null;

    const configs = {
      remove: {
        title: 'Remove participant?',
        desc: 'They will no longer have access to this group.',
        action: () => removeParticipant(confirmAction.userId),
        loading: removingId === confirmAction.userId,
      },
      leave: {
        title: 'Leave this group?',
        desc: 'You can rejoin later via an invite link.',
        action: leaveGroup,
        loading: leaving,
      },
      delete: {
        title: 'Delete group permanently?',
        desc: 'All messages and data will be lost. This cannot be undone.',
        action: deleteGroup,
        loading: deleting,
      },
    };

    const cfg = configs[confirmAction.type];
    if (!cfg) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-sm rounded-2xl bg-bg-elevated border border-white/10 p-6 shadow-2xl"
        >
          <h3 className="text-lg font-semibold text-text-primary">{cfg.title}</h3>
          <p className="mt-2 text-sm text-text-secondary">{cfg.desc}</p>
          <div className="mt-6 flex gap-3 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setConfirmAction(null)} disabled={cfg.loading}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={cfg.action} disabled={cfg.loading}>
              {cfg.loading ? <Spinner className="w-4 h-4" /> : 'Confirm'}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // Render (unchanged)
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Spinner className="w-6 h-6" aria-label="Loading room info" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <p className="text-status-error text-sm">{error}</p>
        <Button variant="secondary" size="sm" onClick={fetchData} className="mt-3">
          Retry
        </Button>
      </div>
    );
  }

  const isExpired = inviteExpiry && new Date(inviteExpiry) < new Date();

  return (
    <>
      {renderConfirm()}

      {reportModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-2xl bg-bg-elevated border border-white/10 p-6 shadow-2xl"
          >
            <h3 className="text-lg font-semibold text-text-primary">
              Report {reportModal.targetName || (reportModal.targetUserId ? 'User' : 'Group')}
            </h3>

            <p className="mt-2 text-sm text-text-secondary">
              Please provide a reason for this report.
            </p>

            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Why are you reporting this?"
              rows={4}
              className="mt-4 w-full rounded-lg bg-bg-base border border-white/10 p-2 text-text-primary"
            />

            <div className="mt-6 flex gap-3 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReportModal({ open: false, targetUserId: null, targetName: null })}
              >
                Cancel
              </Button>

              <Button
                variant="danger"
                size="sm"
                onClick={submitReport}
                disabled={!reportReason.trim() || reporting}
              >
                {reporting ? <Spinner className="w-4 h-4" /> : 'Submit Report'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      <motion.div
        variants={slideFromRight}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ type: 'spring', stiffness: 260, damping: 25 }}
        className="flex flex-col h-full bg-bg-base border-l border-white/10"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-h3 font-semibold text-text-primary">Room Info</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close panel">
            <XMarkIcon className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {actionError && (
            <div className="flex items-center gap-2 rounded-lg bg-status-error/10 px-3 py-2 text-sm text-status-error">
              <ExclamationCircleIcon className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1">{actionError}</span>
              <button onClick={() => setActionError(null)} className="hover:opacity-70">
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Room details */}
          <div>
            <h3 className="text-sm font-medium text-text-tertiary uppercase tracking-wider mb-2">
              {room?.is_group ? 'Group details' : 'Conversation'}
            </h3>
            <p className="text-text-primary font-medium">
              {room?.name || (room?.product?.name ?? 'Private Chat')}
            </p>
            {room?.description && (
              <p className="text-text-secondary text-sm mt-1">{room.description}</p>
            )}
            <p className="text-text-tertiary text-xs mt-2">
              Created {new Date(room?.created_at).toLocaleDateString()}
            </p>
          </div>

          {/* Participants */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-text-tertiary uppercase tracking-wider">
                Participants ({participants.length})
              </h3>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled
                  title="Add member (coming soon)"
                  aria-label="Add member (coming soon)"
                >
                  <UserPlusIcon className="w-4 h-4 opacity-50" />
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {participants.map((part) => (
                <div key={part.user_id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar name={part.name} size={32} />
                    <div className="truncate">
                      <p className="text-text-primary text-sm font-medium truncate">{part.name}</p>
                      <p className="text-text-tertiary text-xs">
                        {part.role === 'admin' ? 'Admin' : 'Member'}
                      </p>
                    </div>
                  </div>
                  {isAdmin && part.user_id !== currentUserId && (
                    <div className="flex gap-1">
                      {part.role === 'admin' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateRole(part.user_id, 'member')}
                          disabled={updatingRoleId === part.user_id}
                          title="Demote to member"
                        >
                          {updatingRoleId === part.user_id ? (
                            <Spinner className="w-4 h-4" />
                          ) : (
                            <UserIcon className="w-4 h-4" />
                          )}
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateRole(part.user_id, 'admin')}
                          disabled={updatingRoleId === part.user_id}
                          title="Promote to admin"
                        >
                          {updatingRoleId === part.user_id ? (
                            <Spinner className="w-4 h-4" />
                          ) : (
                            <ShieldCheckIcon className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmAction({ type: 'remove', userId: part.user_id })}
                        disabled={removingId === part.user_id}
                        title="Remove from group"
                      >
                        {removingId === part.user_id ? (
                          <Spinner className="w-4 h-4" />
                        ) : (
                          <UserMinusIcon className="w-4 h-4" />
                        )}
                      </Button>
                      {part.user_id !== currentUserId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setReportModal({
                              open: true,
                              targetUserId: part.user_id,
                              targetName: part.name,
                            })
                          }
                          title="Report user"
                        >
                          <FlagIcon className="w-4 h-4 text-status-error" />
                        </Button>
                      )}
                    </div>
                  )}
                  {part.user_id === currentUserId && part.role === 'admin' && (
                    <ShieldCheckIcon className="w-4 h-4 text-accent-primary" title="You are admin" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Invite */}
          {room?.is_group && isAdmin && (
            <div>
              <h3 className="text-sm font-medium text-text-tertiary uppercase tracking-wider mb-2">
                Invite link
              </h3>
              {inviteError && (
                <div className="mb-2 flex items-center gap-2 rounded-lg bg-status-error/10 px-3 py-2 text-xs text-status-error">
                  <ExclamationCircleIcon className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="flex-1">{inviteError}</span>
                  <button onClick={() => setInviteError(null)} className="hover:opacity-70">
                    <XMarkIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              {!inviteCode || isExpired ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={generateInvite}
                  disabled={generatingInvite}
                  className="w-full"
                >
                  {generatingInvite ? (
                    <Spinner className="w-4 h-4 mr-1" />
                  ) : (
                    <LinkIcon className="w-4 h-4 mr-1" />
                  )}
                  Generate invite link
                </Button>
              ) : (
                <div className="flex gap-2 items-center">
                  <code className="flex-1 truncate bg-bg-elevated px-2 py-1.5 rounded text-xs text-text-secondary">
                    {inviteCode}
                  </code>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={copyInviteLink}
                    className="flex-shrink-0"
                  >
                    {copied ? <CheckIcon className="w-4 h-4" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
                  </Button>
                </div>
              )}
              {inviteExpiry && !isExpired && (
                <p className="text-text-tertiary text-xs mt-2">
                  Expires {new Date(inviteExpiry).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {/* Danger zone */}
          <div className="pt-4 border-t border-white/10">
            <h3 className="text-sm font-medium text-status-error uppercase tracking-wider mb-2">
              Danger zone
            </h3>
            {room?.is_group ? (
              <>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setConfirmAction({ type: 'leave' })}
                  disabled={leaving}
                  className="w-full mb-2"
                >
                  <ArrowLeftStartOnRectangleIcon className="w-4 h-4 mr-1" />
                  Leave group
                </Button>
                {isAdmin && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setConfirmAction({ type: 'delete' })}
                    disabled={deleting}
                    className="w-full"
                  >
                    <TrashIcon className="w-4 h-4 mr-1" />
                    Delete group permanently
                  </Button>
                )}
              </>
            ) : (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setConfirmAction({ type: 'leave' })}
                disabled={leaving}
                className="w-full"
              >
                <ArrowLeftStartOnRectangleIcon className="w-4 h-4 mr-1" />
                Leave conversation
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                setReportModal({
                  open: true,
                  targetUserId: null,
                  targetName: 'this room',
                })
              }
              className="w-full mt-2 text-status-error hover:bg-status-error/10"
            >
              <FlagIcon className="w-4 h-4 mr-1" /> Report this room
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
}