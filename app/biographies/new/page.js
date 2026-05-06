'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import Link from 'next/link';
import { createDiscussion } from '@/lib/contentService';
import { useAuthUser } from '@/lib/utils/useAuthUser';
import { addTag, removeTag, MAX_TAGS } from '@/lib/utils/tagHelpers';
import { validateContent } from '@/lib/utils/validateContent';
// =============================================================================
// Wave Background (FIXED: useEffect)
// =============================================================================
function WaveBackground() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (isMobile) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <svg className="absolute bottom-0 left-0 w-full h-64" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <motion.path
          fill="rgba(6, 182, 212, 0.05)"
          d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          animate={{
            d: [
              "M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,106.7C672,117,768,171,864,176C960,181,1056,139,1152,122.7C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>
    </div>
  );
}

// =============================================================================
// Magnetic Input
// =============================================================================
function MagneticInput({ label, value, onChange, placeholder, required, multiline = false, rows = 4, icon }) {
  const ref = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const distX = e.clientX - (rect.left + rect.width / 2);
    const distY = e.clientY - (rect.top + rect.height / 2);
    if (ref.current) {
      ref.current.style.transform = `translate(${distX * 0.03}px, ${distY * 0.03}px)`;
    }
  };

  const handleMouseLeave = () => {
    if (ref.current) {
      ref.current.style.transform = 'translate(0, 0)';
    }
  };

  const InputComponent = multiline ? 'textarea' : 'input';

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative transition-transform duration-200"
    >
      <motion.label
        animate={{ color: isFocused ? '#06b6d4' : '#9ca3af', x: isFocused ? 5 : 0 }}
        className="block text-sm font-semibold mb-2 transition-colors"
      >
        {icon && <span className="mr-2">{icon}</span>}
        {label}
        {required && <span className="text-cyan-400 ml-1">*</span>}
      </motion.label>
      <motion.div
        animate={{
          boxShadow: isFocused 
            ? '0 0 0 3px rgba(6, 182, 212, 0.2), 0 4px 20px rgba(6, 182, 212, 0.1)'
            : '0 0 0 0px rgba(6, 182, 212, 0)',
        }}
        className="rounded-xl overflow-hidden"
      >
        <InputComponent
          type={multiline ? undefined : 'text'}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          required={required}
          rows={multiline ? rows : undefined}
          className={`w-full px-5 py-3.5 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all ${multiline ? 'resize-none leading-relaxed' : ''}`}
        />
      </motion.div>
    </motion.div>
  );
}

// =============================================================================
// Animated Button
// =============================================================================
function AnimatedButton({ children, onClick, type = 'button', variant = 'primary', disabled, loading }) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`relative overflow-hidden px-8 py-3.5 rounded-xl font-bold text-sm transition-all ${
        variant === 'primary'
          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50'
          : variant === 'secondary'
          ? 'bg-gray-800/50 backdrop-blur-sm text-gray-300 border border-gray-700/50 hover:bg-gray-700/50'
          : 'text-gray-400 hover:text-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            Creating...
          </motion.div>
        ) : (
          <motion.span key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// =============================================================================
// Discussion Type Selector
// =============================================================================
function DiscussionTypeSelector({ selected, onSelect }) {
  const types = [
    { key: 'general', label: 'General', icon: '💬', desc: 'Open discussion' },
    { key: 'debate', label: 'Debate', icon: '⚖️', desc: 'Structured argument' },
    { key: 'poll', label: 'Poll', icon: '📊', desc: 'Community vote' },
    { key: 'help', label: 'Help', icon: '🆘', desc: 'Need assistance' },
  ];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-400">Discussion Type</label>
      <div className="grid grid-cols-2 gap-3">
        {types.map((type) => (
          <motion.button
            key={type.key}
            type="button"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(type.key === selected ? '' : type.key)}
            className={`p-4 rounded-xl border transition-all text-left ${
              selected === type.key
                ? 'bg-cyan-500/10 border-cyan-500/30'
                : 'bg-gray-800/30 border-gray-700/30 hover:bg-gray-700/30'
            }`}
          >
            <span className="text-2xl mb-1 block">{type.icon}</span>
            <span className={`font-semibold text-sm ${selected === type.key ? 'text-cyan-400' : 'text-gray-300'}`}>{type.label}</span>
            <span className="text-xs text-gray-500 block mt-0.5">{type.desc}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// Discussion Preview
// =============================================================================
function DiscussionPreview({ title, opening, type, tags }) {
  const typeConfig = {
    general: { icon: '💬', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
    debate: { icon: '⚖️', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    poll: { icon: '📊', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    help: { icon: '🆘', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  };
  const config = typeConfig[type] || typeConfig.general;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50"
    >
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="text-3xl"
        >
          {config.icon}
        </motion.div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color} ${config.border} border`}>
          {type || 'General'} Discussion
        </span>
      </div>
      <h3 className="text-xl font-bold text-gray-100 mb-3">{title || 'Discussion Topic'}</h3>
      <p className="text-gray-400 text-sm leading-relaxed mb-4">{opening || 'Opening post will appear here...'}</p>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <span key={tag} className="px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs border border-cyan-500/20">{tag}</span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// =============================================================================
// Main Discussions Create Page
// =============================================================================
export default function NewDiscussionPage() {
  const router = useRouter();
  const { user, loading: authLoading, requireAuth } = useAuthUser({ redirectTo: '/discussions/new' });

  const [title, setTitle] = useState('');
  const [opening, setOpening] = useState('');
  const [discussionType, setDiscussionType] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleAddTag = useCallback(() => {
    const newTags = addTag(tags, tagInput);
    if (newTags.length === tags.length && tagInput.trim()) {
      if (tags.length >= MAX_TAGS) {
        setFormError(`Maximum ${MAX_TAGS} tags allowed`);
        setTimeout(() => setFormError(null), 3000);
      }
    } else {
      setTags(newTags);
      setTagInput('');
      setFormError(null);
    }
  }, [tags, tagInput]);

  const handleRemoveTag = useCallback((tag) => {
    setTags(removeTag(tags, tag));
  }, [tags]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setFormError(null);

    const currentUser = requireAuth();
    if (!currentUser) return;

    const validation = validateContent({ title, content: opening });
    if (!validation.isValid) {
      setFormError(validation.errors.join(', '));
      return;
    }

    setSubmitting(true);
    try {
      const result = await createDiscussion({
        title,
        content: opening,
        discussion_type: discussionType,
        tags,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to start discussion');
      }

      router.push('/community');
    } catch (err) {
      console.error('Create discussion error:', err);
      setFormError(err.message || 'Failed to start discussion. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [title, opening, discussionType, tags, requireAuth, router]);

  if (authLoading) {
    return (
      <Container className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="rounded-full h-12 w-12 border-b-2 border-cyan-500"
        />
      </Container>
    );
  }

  if (!user) return null;

  return (
    <>
      <WaveBackground />

      <main className="min-h-screen bg-gray-950 py-8 relative z-10">
        <Container className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link href="/community">
              <motion.span
                whileHover={{ x: -5 }}
                className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors mb-4 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back to Feed
              </motion.span>
            </Link>
            <motion.h1
              className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400"
              animate={{ backgroundPosition: ['0%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
              style={{ backgroundSize: '200%' }}
            >
              💬 Start a Discussion
            </motion.h1>
            <p className="text-gray-400 mt-2">Spark meaningful conversations</p>
          </motion.div>

          <AnimatePresence>
            {formError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-red-400 text-sm"
              >
                ⚠️ {formError}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid lg:grid-cols-2 gap-8">
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <MagneticInput
                label="Topic"
                icon="💬"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What do you want to discuss?"
                required
              />

              <DiscussionTypeSelector selected={discussionType} onSelect={setDiscussionType} />

              <MagneticInput
                label="Opening Post"
                icon="📝"
                multiline
                rows={8}
                value={opening}
                onChange={(e) => setOpening(e.target.value)}
                placeholder="Share your thoughts to kick off the discussion..."
                required
              />

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-400">
                  Tags <span className="text-gray-500">({tags.length}/{MAX_TAGS})</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  <AnimatePresence>
                    {tags.map((tag) => (
                      <motion.span
                        key={tag}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        layout
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-sm border border-cyan-500/20"
                      >
                        {tag}
                        <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1 text-cyan-400/60 hover:text-cyan-400">×</button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="technology, ethics, future"
                    className="flex-1 px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddTag}
                    className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    Add
                  </motion.button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowPreview(!showPreview)}
                  className="px-6 py-3 rounded-xl bg-gray-800/50 text-gray-300 border border-gray-700/50 hover:bg-gray-700/50 transition-all font-medium"
                >
                  {showPreview ? 'Hide' : 'Show'} Preview
                </motion.button>
                <AnimatedButton type="submit" loading={submitting} disabled={!title.trim() || !opening.trim()}>
                  💬 Start Discussion
                </AnimatedButton>
              </div>
            </motion.form>

            <AnimatePresence>
              {showPreview && (
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-bold text-gray-300">Live Preview</h3>
                  <DiscussionPreview title={title} opening={opening} type={discussionType} tags={tags} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Container>
      </main>
    </>
  );
}