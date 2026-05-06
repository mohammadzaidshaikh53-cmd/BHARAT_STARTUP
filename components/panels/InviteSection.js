// components/panels/InviteSection.js
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import {
  LinkIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ExclamationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export function InviteSection({ roomId, isAdmin }) {
  const [inviteCode, setInviteCode] = useState(null);
  const [inviteExpiry, setInviteExpiry] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  // Fetch existing active invite (only one active per room)
  useEffect(() => {
    if (!roomId) return;

    const fetchInvite = async () => {
      setInitialLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('group_invites')
          .select('invite_code, expires_at')
          .eq('room_id', roomId)
          .gt('expires_at', new Date().toISOString()) // only active invites
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (fetchError) throw fetchError;
        if (data) {
          setInviteCode(data.invite_code);
          setInviteExpiry(data.expires_at);
        }
      } catch (err) {
        console.error('Fetch invite error:', err);
        setError('Failed to load invite link');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchInvite();
  }, [roomId]);

  const generateInvite = async () => {
    if (!isAdmin) return;
    setGenerating(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc('create_group_invite', {
        p_room_id: roomId,
        p_valid_for: '7 days',
      });
      if (rpcError) throw rpcError;

      // data is a single row with { invite_code, expires_at }
      setInviteCode(data.invite_code);
      setInviteExpiry(data.expires_at);
    } catch (err) {
      console.error('Generate invite error:', err);
      setError(err.message || 'Failed to generate invite link');
    } finally {
      setGenerating(false);
    }
  };

  const copyInviteLink = async () => {
    const fullLink = `${window.location.origin}/invite/${inviteCode}`;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(fullLink);
      } else {
        // Fallback for HTTP or older browsers
        const textArea = document.createElement('textarea');
        textArea.value = fullLink;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Clipboard error:', err);
      setError('Failed to copy link. Please copy manually.');
    }
  };

  if (!isAdmin) return null;

  const isExpired = inviteExpiry && new Date(inviteExpiry).getTime() < Date.now();

  if (initialLoading) {
    return (
      <div className="flex items-center gap-2 text-text-tertiary text-sm py-2">
        <Spinner className="w-4 h-4" />
        <span>Loading invite...</span>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-medium text-text-tertiary uppercase tracking-wider mb-2">
        Invite link
      </h3>

      {error && (
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-status-error/10 px-3 py-2 text-sm text-status-error">
          <ExclamationCircleIcon className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="hover:opacity-70">
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {!inviteCode || isExpired ? (
        <Button
          variant="secondary"
          size="sm"
          onClick={generateInvite}
          disabled={generating}
          className="w-full"
        >
          {generating ? <Spinner className="w-4 h-4 mr-1" /> : <LinkIcon className="w-4 h-4 mr-1" />}
          {generating ? 'Generating...' : 'Generate invite link'}
        </Button>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 items-center">
            <code className="flex-1 truncate bg-bg-elevated px-2 py-1.5 rounded text-xs text-text-secondary">
              {window.location.origin}/invite/{inviteCode}
            </code>
            <Button
              variant="secondary"
              size="sm"
              onClick={copyInviteLink}
              className="flex-shrink-0"
              title="Copy full link"
            >
              {copied ? <CheckIcon className="w-4 h-4" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-text-tertiary text-xs">
            Expires {new Date(inviteExpiry).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}