'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import Link from 'next/link';
import { createQuestion } from '@/lib/contentService';
import { useAuthUser } from '@/lib/utils/useAuthUser';
import { addTag, removeTag, MAX_TAGS } from '@/lib/utils/tagHelpers';
import { validateContent } from '@/lib/utils/validateContent';

// =============================================================================
// Neural Network Background (FIXED: useEffect)
// =============================================================================
function NeuralBackground() {
  const canvasRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let nodes = [];
    let animationId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 25; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      nodes.forEach((node, i) => {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.fill();

        nodes.slice(i + 1).forEach(other => {
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(16, 185, 129, ${0.15 * (1 - dist / 200)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [isMobile]);

  if (isMobile) return null;
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" style={{ opacity: 0.4 }} />;
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
        animate={{ color: isFocused ? '#10b981' : '#9ca3af', x: isFocused ? 5 : 0 }}
        className="block text-sm font-semibold mb-2 transition-colors"
      >
        {icon && <span className="mr-2">{icon}</span>}
        {label}
        {required && <span className="text-emerald-400 ml-1">*</span>}
      </motion.label>
      <motion.div
        animate={{
          boxShadow: isFocused 
            ? '0 0 0 3px rgba(16, 185, 129, 0.2), 0 4px 20px rgba(16, 185, 129, 0.1)'
            : '0 0 0 0px rgba(16, 185, 129, 0)',
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
          className={`w-full px-5 py-3.5 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all ${multiline ? 'resize-none leading-relaxed' : ''}`}
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
          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50'
          : variant === 'secondary'
          ? 'bg-gray-800/50 backdrop-blur-sm text-gray-300 border border-gray-700/50 hover:bg-gray-700/50'
          : 'text-gray-400 hover:text-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            Posting...
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
// Question Preview
// =============================================================================
function QuestionPreview({ title, details, tags, bounty }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50"
    >
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="text-3xl"
        >
          ❓
        </motion.div>
        <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">Q&A</span>
        {bounty > 0 && (
          <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full border border-amber-500/20">
            🏆 {bounty} pts bounty
          </span>
        )}
      </div>
      <h3 className="text-xl font-bold text-gray-100 mb-3">{title || 'Your Question'}</h3>
      <p className="text-gray-400 text-sm leading-relaxed mb-4">{details || 'Question details will appear here...'}</p>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <span key={tag} className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">{tag}</span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// =============================================================================
// Main Q&A Create Page
// =============================================================================
export default function NewQAPage() {
  const router = useRouter();
  const { user, loading: authLoading, requireAuth } = useAuthUser({ redirectTo: '/qa/new' });

  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [bounty, setBounty] = useState(0);
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

    const validation = validateContent({ title, content: details });
    if (!validation.isValid) {
      setFormError(validation.errors.join(', '));
      return;
    }

    setSubmitting(true);
    try {
      const result = await createQuestion({
        title,
        content: details,
        tags,
        bounty_points: bounty,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to post question');
      }

      router.push('/community');
    } catch (err) {
      console.error('Create question error:', err);
      setFormError(err.message || 'Failed to post question. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [title, details, tags, bounty, requireAuth, router]);

  if (authLoading) {
    return (
      <Container className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="rounded-full h-12 w-12 border-b-2 border-emerald-500"
        />
      </Container>
    );
  }

  if (!user) return null;

  return (
    <>
      <NeuralBackground />

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
                className="inline-flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-colors mb-4 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back to Feed
              </motion.span>
            </Link>
            <motion.h1
              className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400"
              animate={{ backgroundPosition: ['0%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
              style={{ backgroundSize: '200%' }}
            >
              ❓ Ask a Question
            </motion.h1>
            <p className="text-gray-400 mt-2">Get answers from the community</p>
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
                label="Question Title"
                icon="❓"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., How do I optimize React performance?"
                required
              />

              <MagneticInput
                label="Details"
                icon="📝"
                multiline
                rows={8}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Provide context, what you've tried, and what you need help with..."
                required
              />

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-400">
                  Bounty Points <span className="text-amber-400">{bounty}</span>
                </label>
                <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full"
                    style={{ width: `${(bounty / 100) * 100}%` }}
                    layout
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={bounty}
                    onChange={(e) => setBounty(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <p className="text-xs text-gray-500">Offer points to incentivize quality answers</p>
              </div>

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
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm border border-emerald-500/20"
                      >
                        {tag}
                        <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1 text-emerald-400/60 hover:text-emerald-400">×</button>
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
                    placeholder="react, javascript, performance"
                    className="flex-1 px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
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
                <AnimatedButton type="submit" loading={submitting} disabled={!title.trim() || !details.trim()}>
                  ❓ Post Question
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
                  <QuestionPreview title={title} details={details} tags={tags} bounty={bounty} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Container>
      </main>
    </>
  );
}