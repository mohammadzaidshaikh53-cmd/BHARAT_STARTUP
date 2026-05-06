'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import Link from 'next/link';
import { createIdea } from '@/lib/contentService';
import { useAuthUser } from '@/lib/utils/useAuthUser';
import { addTag, removeTag, MAX_TAGS } from '@/lib/utils/tagHelpers';
import { validateContent } from '@/lib/utils/validateContent';

const IDEA_CATEGORIES = [
  'Technology',
  'Business',
  'Education',
  'Health',
  'Environment',
  'Entertainment',
  'Science',
  'Art',
  'Social',
  'Other',
];

const FLOATING_ORBS = [
  {
    size: 260,
    color: 'rgba(147, 51, 234, 0.15)',
    left: '12%',
    top: '16%',
    x: [0, 42, 0],
    y: [0, -28, 0],
    scale: [1, 1.18, 1],
    duration: 19,
  },
  {
    size: 340,
    color: 'rgba(249, 115, 22, 0.10)',
    left: '68%',
    top: '10%',
    x: [0, -36, 0],
    y: [0, 22, 0],
    scale: [1, 1.14, 1],
    duration: 22,
  },
  {
    size: 300,
    color: 'rgba(59, 130, 246, 0.10)',
    left: '78%',
    top: '58%',
    x: [0, 28, 0],
    y: [0, -34, 0],
    scale: [1, 1.16, 1],
    duration: 21,
  },
  {
    size: 280,
    color: 'rgba(168, 85, 247, 0.12)',
    left: '22%',
    top: '66%',
    x: [0, -24, 0],
    y: [0, 30, 0],
    scale: [1, 1.12, 1],
    duration: 23,
  },
  {
    size: 220,
    color: 'rgba(236, 72, 153, 0.10)',
    left: '48%',
    top: '26%',
    x: [0, 18, 0],
    y: [0, -18, 0],
    scale: [1, 1.1, 1],
    duration: 18,
  },
  {
    size: 240,
    color: 'rgba(14, 165, 233, 0.10)',
    left: '5%',
    top: '50%',
    x: [0, 34, 0],
    y: [0, 16, 0],
    scale: [1, 1.13, 1],
    duration: 20,
  },
];

// =============================================================================
// Floating Orbs Background
// =============================================================================
function FloatingOrbs() {
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
      {FLOATING_ORBS.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl"
          style={{
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            left: orb.left,
            top: orb.top,
          }}
          animate={{
            x: orb.x,
            y: orb.y,
            scale: orb.scale,
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// =============================================================================
// Magnetic Input
// =============================================================================
function MagneticInput({
  label,
  value,
  onChange,
  placeholder,
  required,
  multiline = false,
  rows = 4,
  icon,
  type = 'text',
}) {
  const ref = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const distX = e.clientX - (rect.left + rect.width / 2);
    const distY = e.clientY - (rect.top + rect.height / 2);
    ref.current.style.transform = `translate(${distX * 0.03}px, ${distY * 0.03}px)`;
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
        animate={{ color: isFocused ? '#a855f7' : '#9ca3af', x: isFocused ? 5 : 0 }}
        className="block text-sm font-semibold mb-2 transition-colors"
      >
        {icon && <span className="mr-2">{icon}</span>}
        {label}
        {required && <span className="text-purple-400 ml-1">*</span>}
      </motion.label>

      <motion.div
        animate={{
          boxShadow: isFocused
            ? '0 0 0 3px rgba(168, 85, 247, 0.2), 0 4px 20px rgba(168, 85, 247, 0.1)'
            : '0 0 0 0px rgba(168, 85, 247, 0)',
        }}
        className="rounded-xl overflow-hidden"
      >
        <InputComponent
          type={multiline ? undefined : type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          required={required}
          rows={multiline ? rows : undefined}
          className={`w-full px-5 py-3.5 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all ${
            multiline ? 'resize-none leading-relaxed' : ''
          }`}
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
          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50'
          : variant === 'secondary'
          ? 'bg-gray-800/50 backdrop-blur-sm text-gray-300 border border-gray-700/50 hover:bg-gray-700/50'
          : 'text-gray-400 hover:text-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
            />
            Publishing...
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
// Impact Slider
// =============================================================================
function ImpactSlider({ value, onChange }) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-400">
        Impact Level <span className="text-purple-400">{value}/10</span>
      </label>
      <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
          style={{ width: `${value * 10}%` }}
          layout
        />
        <input
          type="range"
          min="1"
          max="10"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>Small</span>
        <span>Medium</span>
        <span>Revolutionary</span>
      </div>
    </div>
  );
}

// =============================================================================
// Idea Preview Card
// =============================================================================
function IdeaPreview({ title, description, category, impact }) {
  return (
    <motion.div
      initial={{ opacity: 0, rotateX: -15 }}
      animate={{ opacity: 1, rotateX: 0 }}
      className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50"
    >
      <div className="flex items-start gap-4">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="text-4xl"
        >
          💡
        </motion.div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-100 mb-2">{title || 'Your Idea Title'}</h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-3">
            {description || 'Your idea description will appear here...'}
          </p>
          <div className="flex items-center gap-3">
            {category && (
              <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-medium border border-purple-500/20">
                {category}
              </span>
            )}
            {impact > 0 && (
              <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-medium border border-orange-500/20">
                Impact: {impact}/10
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// =============================================================================
// Main Ideas Create Page
// =============================================================================
export default function NewIdeaPage() {
  const router = useRouter();
  const { user, loading: authLoading, requireAuth } = useAuthUser({ redirectTo: '/ideas/new' });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [impact, setImpact] = useState(5);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleAddTag = useCallback(() => {
    const newTags = addTag(tags, tagInput);

    if (newTags.length === tags.length) {
      if (tagInput.trim() && tags.length >= MAX_TAGS) {
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

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setFormError(null);

      const currentUser = requireAuth();
      if (!currentUser) return;

      const validation = validateContent({ title, content: description });
      if (!validation.isValid) {
        setFormError(validation.errors.join(', '));
        return;
      }

      setSubmitting(true);
      try {
        const result = await createIdea({
          title,
          description,
          category,
          impact_level: impact,
          tags,
        });

        if (!result.success) {
          throw new Error(result.error || 'Failed to create idea');
        }

        router.push('/community');
      } catch (err) {
        console.error('Create idea error:', err);
        setFormError(err.message || 'Failed to create idea. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
    [title, description, category, impact, tags, requireAuth, router]
  );

  if (authLoading) {
    return (
      <Container className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="rounded-full h-12 w-12 border-b-2 border-purple-500"
        />
      </Container>
    );
  }

  if (!user) return null;

  return (
    <>
      <FloatingOrbs />

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
                className="inline-flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors mb-4 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Feed
              </motion.span>
            </Link>

            <motion.h1
              className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400"
              animate={{ backgroundPosition: ['0%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
              style={{ backgroundSize: '200%' }}
            >
              💡 Share an Idea
            </motion.h1>
            <p className="text-gray-400 mt-2">Turn your sparks into flames</p>
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
                label="Idea Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's your big idea?"
                required
              />

              <MagneticInput
                label="Description"
                multiline
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your idea in detail. What problem does it solve? How does it work?"
                required
              />

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-400">Category</label>
                <div className="flex flex-wrap gap-2">
                  {IDEA_CATEGORIES.map((cat) => (
                    <motion.button
                      key={cat}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCategory(cat === category ? '' : cat)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        category === cat
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'bg-gray-800/50 text-gray-400 border border-gray-700/30 hover:bg-gray-700/50'
                      }`}
                    >
                      {cat}
                    </motion.button>
                  ))}
                </div>
              </div>

              <ImpactSlider value={impact} onChange={setImpact} />

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
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-sm border border-purple-500/20"
                      >
                        {tag}
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.8 }}
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 text-purple-400/60 hover:text-purple-400"
                        >
                          ×
                        </motion.button>
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
                    placeholder="Add tag and press Enter"
                    className="flex-1 px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
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

                <AnimatedButton type="submit" loading={submitting} disabled={!title.trim() || !description.trim()}>
                  💡 Post Idea
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
                  <IdeaPreview title={title} description={description} category={category} impact={impact} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Container>
      </main>
    </>
  );
}