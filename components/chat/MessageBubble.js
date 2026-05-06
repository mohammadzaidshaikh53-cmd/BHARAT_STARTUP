// components/chat/MessageBubble.js
'use client';

import { memo, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/common/Avatar';
import {
  Check,
  CheckCheck,
  Pencil,
  Trash2,
  FileText,
  Film,
  Image as ImageIcon,
  Music,
  Reply,
  SmilePlus,
  MoreHorizontal,
  Download,
  Play,
  Pause,
  X,
  Link as LinkIcon,
  Forward,
  Copy,
  Pin,
} from 'lucide-react';

// -----------------------------------------------------------------------------
// CONSTANTS
// -----------------------------------------------------------------------------
const REACTIONS = [
  { emoji: '👍', label: 'like' },
  { emoji: '❤️', label: 'love' },
  { emoji: '😂', label: 'laugh' },
  { emoji: '😮', label: 'wow' },
  { emoji: '🎉', label: 'celebrate' },
  { emoji: '🔥', label: 'fire' },
];

const SWIPE_THRESHOLD = 80;

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) return 'Today';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getFileNameFromUrl = (url) => {
  if (!url) return 'File';
  try {
    const decoded = decodeURIComponent(url);
    const parts = decoded.split('/');
    const name = parts.pop() || 'File';
    return name.split('?')[0]; // Remove query params
  } catch {
    return 'File';
  }
};

const getFileExtension = (url) => {
  const name = getFileNameFromUrl(url);
  const parts = name.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
};

const getFileIcon = (type, url) => {
  const ext = getFileExtension(url);
  if (type === 'image' || ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) return ImageIcon;
  if (type === 'video' || ['mp4', 'mov', 'avi'].includes(ext)) return Film;
  if (type === 'audio' || ['mp3', 'wav', 'ogg'].includes(ext)) return Music;
  if (ext === 'pdf') return FileText;
  return LinkIcon;
};

// -----------------------------------------------------------------------------
// SUB-COMPONENT: Status Indicator
// -----------------------------------------------------------------------------
const StatusIndicator = memo(({ status, readers }) => {
  const normalized = status?.toLowerCase();
  
  if (normalized === 'read' && readers?.length > 0) {
    return (
      <div className="flex items-center gap-0.5">
        {readers.slice(0, 2).map((reader, i) => (
          <div key={reader.id || i} className="w-3 h-3 rounded-full overflow-hidden ring-1 ring-white dark:ring-gray-800 -ml-1 first:ml-0">
            <Avatar name={reader.name || 'User'} src={reader.avatar_url} size={12} />
          </div>
        ))}
        {readers.length > 2 && (
          <span className="text-[9px] text-gray-400 ml-0.5">+{readers.length - 2}</span>
        )}
      </div>
    );
  }
  
  if (normalized === 'read') {
    return <CheckCheck className="h-3.5 w-3.5 text-blue-500" />;
  }
  
  if (normalized === 'delivered') {
    return <CheckCheck className="h-3.5 w-3.5 text-gray-400" />;
  }
  
  return <Check className="h-3.5 w-3.5 text-gray-300" />;
});
StatusIndicator.displayName = 'StatusIndicator';

// -----------------------------------------------------------------------------
// SUB-COMPONENT: Media Preview
// -----------------------------------------------------------------------------
const MediaPreview = memo(({ url, type, onExpand }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  if (!url) return null;

  // Image
  if (type === 'image' || ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(getFileExtension(url))) {
    return (
      <motion.div 
        layout
        className="relative mb-2 overflow-hidden rounded-xl cursor-zoom-in group"
        onClick={() => onExpand?.(url)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Image
          src={url}
          alt="Attachment"
          width={400}
          height={300}
          className={cn(
            "max-h-72 w-auto object-cover transition-all duration-500",
            !isLoaded && "blur-xl scale-110"
          )}
          unoptimized={url?.startsWith('http')}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="p-1.5 rounded-lg bg-black/40 backdrop-blur-md text-white">
            <Download className="h-3.5 w-3.5" />
          </div>
        </div>
      </motion.div>
    );
  }

  // Video
  if (type === 'video') {
    return (
      <div className="relative mb-2 overflow-hidden rounded-xl bg-gray-900 aspect-video">
        <video
          src={url}
          className="w-full h-full object-cover"
          preload="metadata"
          onClick={() => setIsPlaying(!isPlaying)}
        />
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsPlaying(!isPlaying)}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
          </div>
        </motion.button>
      </div>
    );
  }

  // Generic file
  const FileIcon = getFileIcon(type, url);
  const fileName = getFileNameFromUrl(url);
  const fileSize = '2.4 MB'; // You'd calculate this from actual data

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'mb-2 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all',
        'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10'
      )}
    >
      <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center flex-shrink-0">
        <FileIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate font-medium text-gray-900 dark:text-white">{fileName}</p>
        <p className="text-xs text-gray-500">{fileSize}</p>
      </div>
      <Download className="h-4 w-4 text-gray-400 flex-shrink-0" />
    </motion.a>
  );
});
MediaPreview.displayName = 'MediaPreview';

// -----------------------------------------------------------------------------
// SUB-COMPONENT: Reaction Bar
// -----------------------------------------------------------------------------
const ReactionBar = memo(({ reactions, onReact, isOwn }) => {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="relative">
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className={cn(
              'absolute bottom-full mb-2 p-2 rounded-2xl shadow-xl border backdrop-blur-xl z-20',
              'bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-white/10',
              isOwn ? 'right-0' : 'left-0'
            )}
          >
            <div className="flex gap-1">
              {REACTIONS.map((reaction) => (
                <motion.button
                  key={reaction.label}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    onReact?.(reaction.emoji);
                    setShowPicker(false);
                  }}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center text-lg transition-colors"
                  title={reaction.label}
                >
                  {reaction.emoji}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-1 mt-1">
        {reactions?.length > 0 && (
          <div className="flex items-center gap-0.5">
            {reactions.map((r, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-xs shadow-sm"
              >
                <span>{r.emoji}</span>
                {r.count > 1 && <span className="text-gray-500 text-[10px]">{r.count}</span>}
              </motion.span>
            ))}
          </div>
        )}
        
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          onClick={() => setShowPicker(!showPicker)}
          className="w-5 h-5 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          <SmilePlus className="h-3.5 w-3.5" />
        </motion.button>
      </div>
    </div>
  );
});
ReactionBar.displayName = 'ReactionBar';

// -----------------------------------------------------------------------------
// SUB-COMPONENT: Context Menu
// -----------------------------------------------------------------------------
const ContextMenu = memo(({ isOpen, onClose, onReply, onEdit, onDelete, onCopy, isOwn }) => {
  if (!isOpen) return null;

  const items = [
    { icon: Reply, label: 'Reply', action: onReply, show: true },
    { icon: Forward, label: 'Forward', action: () => {}, show: true },
    { icon: Copy, label: 'Copy', action: onCopy, show: true },
    { icon: Pin, label: 'Pin', action: () => {}, show: true },
    { icon: Pencil, label: 'Edit', action: onEdit, show: isOwn },
    { icon: Trash2, label: 'Delete', action: onDelete, show: isOwn, danger: true },
  ].filter(i => i.show);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 5 }}
        transition={{ type: 'spring', damping: 25, stiffness: 400 }}
        className={cn(
          'absolute z-30 min-w-[160px] rounded-xl border shadow-2xl overflow-hidden backdrop-blur-xl',
          'bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-white/10'
        )}
      >
        {items.map((item, i) => (
          <button
            key={item.label}
            onClick={() => { item.action?.(); onClose(); }}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors',
              item.danger 
                ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5',
              i < items.length - 1 && 'border-b border-gray-100 dark:border-white/5'
            )}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </button>
        ))}
      </motion.div>
    </AnimatePresence>
  );
});
ContextMenu.displayName = 'ContextMenu';

// -----------------------------------------------------------------------------
// SUB-COMPONENT: Reply Preview
// -----------------------------------------------------------------------------
const ReplyPreview = memo(({ replyTo, isOwn }) => {
  if (!replyTo) return null;

  return (
    <div className={cn(
      'mb-2 pl-3 border-l-2',
      isOwn ? 'border-white/30' : 'border-orange-500/30'
    )}>
      <p className="text-[11px] text-white/60 dark:text-white/40 mb-0.5">{replyTo.sender_name || 'User'}</p>
      <p className="text-xs text-white/80 dark:text-white/60 line-clamp-2">{replyTo.content || '...'}</p>
    </div>
  );
});
ReplyPreview.displayName = 'ReplyPreview';

// -----------------------------------------------------------------------------
// MAIN: MessageBubble
// -----------------------------------------------------------------------------
export const MessageBubble = memo(function MessageBubble({
  message,
  isOwn,
  showAvatar = true,
  senderName,
  className = '',
  onReply,
  onReact,
  isGrouped = false, // True if previous message was same sender
  isLastInGroup = false, // True if next message is different sender
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const bubbleRef = useRef(null);
  
  // Swipe gesture for reply
  const x = useMotionValue(0);
  const xSpring = useSpring(x, { stiffness: 500, damping: 50 });
  const replyIconOpacity = useTransform(xSpring, [-SWIPE_THRESHOLD, -20, 0], [1, 0.5, 0]);
  const replyIconScale = useTransform(xSpring, [-SWIPE_THRESHOLD, -40, 0], [1.2, 1, 0]);

  const {
    id,
    message: content,
    created_at,
    updated_at,
    status,
    sender,
    is_deleted,
    is_edited,
    attachment_url,
    attachment_type,
    reactions,
    reply_to,
  } = message;

  const displayName = sender?.full_name || sender?.username || senderName || 'User';
  const timeLabel = formatTime(updated_at || created_at);
  const dateLabel = formatDate(created_at);

  // Handle swipe release
  const handleDragEnd = useCallback((_, info) => {
    if (info.offset.x < -SWIPE_THRESHOLD) {
      onReply?.(message);
    }
    x.set(0);
  }, [onReply, message, x]);

  // Copy to clipboard
  const handleCopy = useCallback(() => {
    if (content) navigator.clipboard.writeText(content);
  }, [content]);

  return (
    <motion.div
      layout
      ref={bubbleRef}
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: 'spring', 
        stiffness: 500, 
        damping: 35,
        mass: 0.8
      }}
      style={{ x: xSpring }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => { setIsHovered(false); setMenuOpen(false); }}
      className={cn(
        'flex gap-3 relative group',
        isOwn ? 'justify-end' : 'justify-start',
        isGrouped ? 'mt-1' : 'mt-4',
        className
      )}
    >
      {/* Swipe reply indicator */}
      <motion.div
        style={{ opacity: replyIconOpacity, scale: replyIconScale }}
        className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none"
      >
        <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
          <Reply className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        </div>
      </motion.div>

      {/* Avatar */}
      {!isOwn && !isGrouped && showAvatar ? (
        <motion.div 
          layout
          className="flex-shrink-0 self-end"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 400 }}
        >
          <Avatar 
            name={displayName} 
            src={sender?.avatar_url}
            size={32} 
          />
        </motion.div>
      ) : (
        !isOwn && <div className="w-8 flex-shrink-0" />
      )}

      {/* Content column */}
      <div className={cn(
        'flex max-w-[82%] flex-col',
        isOwn ? 'items-end' : 'items-start'
      )}>
        {/* Sender name */}
        {!isOwn && !isGrouped && displayName && (
          <motion.span 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-1 ml-2 text-[11px] font-medium text-gray-500 dark:text-gray-500"
          >
            {displayName}
          </motion.span>
        )}

        {/* Bubble */}
        <div className="relative">
          <motion.div
            layout
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={cn(
              'relative rounded-2xl px-4 py-2.5 break-words shadow-sm backdrop-blur-sm',
              isOwn
                ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-br-md'
                : 'bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white border border-gray-200 dark:border-white/[0.08] rounded-bl-md'
            )}
          >
            {/* Reply preview */}
            {reply_to && <ReplyPreview replyTo={reply_to} isOwn={isOwn} />}

            {/* Deleted state */}
            {is_deleted ? (
              <div className="flex items-center gap-2 text-sm italic opacity-60">
                <Trash2 className="h-3.5 w-3.5" />
                <span>This message was deleted</span>
              </div>
            ) : (
              <>
                {/* Media */}
                {attachment_url && (
                  <MediaPreview 
                    url={attachment_url} 
                    type={attachment_type}
                    onExpand={(url) => window.open(url, '_blank')}
                  />
                )}

                {/* Text */}
                {content && (
                  <p className="whitespace-pre-wrap text-[14px] leading-relaxed">
                    {content}
                  </p>
                )}

                {/* Edited indicator */}
                {is_edited && (
                  <div className={cn(
                    'mt-1 flex items-center gap-1 text-[10px] opacity-60',
                    isOwn ? 'text-white/70' : 'text-gray-500'
                  )}>
                    <Pencil className="h-2.5 w-2.5" />
                    <span>edited</span>
                  </div>
                )}
              </>
            )}
          </motion.div>

          {/* Hover actions */}
          <AnimatePresence>
            {isHovered && !is_deleted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  'absolute top-0 -mt-8 flex items-center gap-1',
                  isOwn ? 'left-0 -ml-2' : 'right-0 -mr-2'
                )}
              >
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => onReply?.(message)}
                  className="w-7 h-7 rounded-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white"
                >
                  <Reply className="h-3.5 w-3.5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-7 h-7 rounded-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </motion.button>
                
                <ContextMenu
                  isOpen={menuOpen}
                  onClose={() => setMenuOpen(false)}
                  onReply={() => onReply?.(message)}
                  onCopy={handleCopy}
                  isOwn={isOwn}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Reactions */}
        {!is_deleted && (
          <ReactionBar 
            reactions={reactions} 
            onReact={(emoji) => onReact?.(id, emoji)}
            isOwn={isOwn}
          />
        )}

        {/* Meta row */}
        <div className={cn(
          'mt-1 flex items-center gap-1.5',
          isOwn ? 'flex-row-reverse' : 'flex-row'
        )}>
          <span className={cn(
            'text-[11px] tabular-nums',
            isOwn ? 'text-orange-300' : 'text-gray-400'
          )}>
            {timeLabel}
          </span>
          
          {isOwn && <StatusIndicator status={status} readers={message.readers} />}
          
          {is_edited && (
            <span className={cn(
              'text-[10px]',
              isOwn ? 'text-orange-300/70' : 'text-gray-400/70'
            )}>
              - edited
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
});