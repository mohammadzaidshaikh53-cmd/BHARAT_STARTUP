// components/chat/Composer.js
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  FaceSmileIcon,
  XMarkIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/common/Spinner';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';   // <-- only addition

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'video/mp4'];
const DRAFT_KEY = (roomId) => `chat-draft-${roomId}`;

export function Composer({ roomId, currentUserId, onSend, disabled = false }) {   // <-- removed onTyping, added currentUserId
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const latestTextRef = useRef('');

  // Broadcast typing (replaces RPC)
  const { broadcastTyping, broadcastStopTyping } = useTypingIndicator({ roomId, currentUserId });

  // Keep the latest text in a ref for saving on unmount
  useEffect(() => {
    latestTextRef.current = text;
  }, [text]);

  // Draft persistence: load on mount (runs once)
  useEffect(() => {
    if (!roomId) return;
    const saved = localStorage.getItem(DRAFT_KEY(roomId));
    if (saved) setText(saved);
  }, [roomId]);

  // Save draft on unmount (using ref to avoid re-running)
  useEffect(() => {
    return () => {
      if (roomId && latestTextRef.current) {
        localStorage.setItem(DRAFT_KEY(roomId), latestTextRef.current);
      }
    };
  }, [roomId]);

  // Auto-resize textarea
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 120);
    textarea.style.height = `${newHeight}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [text, adjustHeight]);

  // ---------------------------------------------------------------------------
  // Typing handler – now uses broadcast (no RPC, no timeout ref)
  // ---------------------------------------------------------------------------
  const handleTyping = useCallback((isTyping) => {
    if (isTyping) {
      broadcastTyping();
    } else {
      broadcastStopTyping();
    }
  }, [broadcastTyping, broadcastStopTyping]);

  // ---------------------------------------------------------------------------
  // File validation (unchanged)
  // ---------------------------------------------------------------------------
  const validateFile = (selectedFile) => {
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError(`File too large. Max ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
      return false;
    }
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError('Unsupported file type.');
      return false;
    }
    return true;
  };

  // ---------------------------------------------------------------------------
  // File upload simulation (unchanged)
  // ---------------------------------------------------------------------------
  const uploadFile = useCallback(async (selectedFile) => {
    // TODO: Replace with actual Supabase Storage upload
    // Example using supabase:
    // const fileExt = selectedFile.name.split('.').pop();
    // const fileName = `${roomId}/${Date.now()}.${fileExt}`;
    // const { data, error } = await supabase.storage
    //   .from('chat-attachments')
    //   .upload(fileName, selectedFile);
    // if (error) throw error;
    // const { data: { publicUrl } } = supabase.storage
    //   .from('chat-attachments')
    //   .getPublicUrl(fileName);
    // return publicUrl;

    // Simulated upload for now:
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          resolve(URL.createObjectURL(selectedFile)); // Replace with real URL
        }
      }, 200);
    });
  }, [roomId]);

  // ---------------------------------------------------------------------------
  // Change handler (uses broadcast typing)
  // ---------------------------------------------------------------------------
  const handleChange = useCallback((e) => {
    const newText = e.target.value;
    setText(newText);
    setError(null);
    handleTyping(true);
  }, [handleTyping]);

  // ---------------------------------------------------------------------------
  // Keydown handler (unchanged)
  // ---------------------------------------------------------------------------
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && !sending && (text.trim() || file)) {
        handleSend();
      }
    }
  }, [disabled, sending, text, file]);

  // ---------------------------------------------------------------------------
  // Send handler – stops typing after send (unchanged but added handleTyping(false))
  // ---------------------------------------------------------------------------
  const handleSend = useCallback(async () => {
    const messageText = text.trim();
    if ((!messageText && !file) || sending || disabled) return;

    setSending(true);
    setError(null);

    let attachmentUrl = null;
    let attachmentType = null;

    try {
      if (file) {
        attachmentUrl = await uploadFile(file);
        attachmentType = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'file';
      }

      await onSend?.({
        text: messageText || (file ? '📎 Attachment' : ''),
        attachment_url: attachmentUrl,
        attachment_type: attachmentType,
      });

      // Clear state
      setText('');
      setFile(null);
      setUploadProgress(0);
      handleTyping(false);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    } catch (err) {
      console.error('Send failed:', err);
      setError(err.message || 'Failed to send. Tap to retry.');
      handleTyping(false);
    } finally {
      setSending(false);
    }
  }, [text, file, sending, disabled, onSend, uploadFile, handleTyping]);

  // ---------------------------------------------------------------------------
  // File selection (unchanged)
  // ---------------------------------------------------------------------------
  const handleFileSelect = useCallback((e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    if (!validateFile(selectedFile)) {
      e.target.value = '';
      return;
    }
    setFile(selectedFile);
    setError(null);
    e.target.value = '';
  }, []);

  const removeFile = useCallback(() => {
    setFile(null);
    setUploadProgress(0);
    setError(null);
  }, []);

  // ---------------------------------------------------------------------------
  // Paste support (unchanged)
  // ---------------------------------------------------------------------------
  const handlePaste = useCallback((e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const blob = item.getAsFile();
        if (blob && validateFile(blob)) {
          setFile(blob);
          setError(null);
        }
        e.preventDefault();
        break;
      }
    }
  }, []);

  const canSend = (text.trim() || file) && !sending && !disabled;

  return (
    <div className="sticky bottom-0 border-t border-white/10 bg-bg-raised p-3">
      {/* Error feedback */}
      {error && (
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-status-error/10 px-3 py-2 text-sm text-status-error">
          <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="hover:opacity-70">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* File preview / upload progress */}
      {file && (
        <div className="mb-2 flex items-center justify-between rounded-lg border border-white/10 bg-bg-elevated px-3 py-2 text-sm">
          <div className="flex items-center gap-2 min-w-0">
            <PaperClipIcon className="w-4 h-4 flex-shrink-0 text-accent-primary" />
            <span className="truncate text-text-primary">{file.name}</span>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <span className="text-xs text-text-tertiary">{uploadProgress}%</span>
            )}
          </div>
          {!sending && (
            <button
              onClick={removeFile}
              className="ml-2 text-text-tertiary hover:text-status-error"
              aria-label="Remove attachment"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Attachment button */}
        <label
          className={cn(
            'cursor-pointer p-2 text-text-tertiary transition-colors hover:text-accent-primary',
            (disabled || sending) && 'pointer-events-none opacity-50'
          )}
          aria-label="Attach file"
          title="Attach file"
        >
          <PaperClipIcon className="w-5 h-5" />
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            disabled={disabled || sending}
            accept={ALLOWED_TYPES.join(',')}
          />
        </label>

        {/* Emoji button (placeholder) */}
        <button
          className="p-2 text-text-tertiary opacity-50 cursor-not-allowed"
          disabled
          aria-label="Emoji picker (coming soon)"
          title="Emoji picker (coming soon)"
        >
          <FaceSmileIcon className="w-5 h-5" />
        </button>

        {/* Text input */}
        <div className="flex-1 rounded-lg bg-bg-elevated border border-white/10 focus-within:border-accent-primary/40 focus-within:shadow-glow-sm">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Type a message..."
            disabled={disabled || sending}
            rows={1}
            className="w-full resize-none bg-transparent px-3 py-2 text-text-primary placeholder-text-tertiary outline-none"
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg bg-accent-primary text-bg-base transition-all',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'hover:shadow-glow-sm active:scale-95'
          )}
          aria-label="Send message"
        >
          {sending ? <Spinner className="w-4 h-4" /> : <PaperAirplaneIcon className="w-5 w-5" />}
        </button>
      </div>

      {/* Hint */}
      <div className="mt-1 text-right text-[10px] text-text-tertiary hidden sm:block">
        Shift + Enter for new line
      </div>
    </div>
  );
}