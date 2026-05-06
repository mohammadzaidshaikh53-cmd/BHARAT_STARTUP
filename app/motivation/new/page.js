'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import Link from 'next/link';
import { createMotivation } from '@/lib/contentService';
import { useAuthUser } from '@/lib/utils/useAuthUser';
import { addTag, removeTag, MAX_TAGS } from '@/lib/utils/tagHelpers';
import { validateContent } from '@/lib/utils/validateContent';

// =============================================================================
// Fire Particle Background (FIXED: useEffect)
// =============================================================================
function FireBackground() {
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
    let particles = [];
    let animationId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: canvas.height + Math.random() * 100,
        size: Math.random() * 3 + 1,
        speedY: -Math.random() * 2 - 0.5,
        speedX: (Math.random() - 0.5) * 1,
        life: Math.random() * 100 + 50,
        maxLife: Math.random() * 100 + 50,
        hue: Math.random() * 40 + 10,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.y * 0.01) * 0.5;
        p.life--;
        p.size *= 0.995;

        if (p.life <= 0 || p.size < 0.5) {
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + Math.random() * 50;
          p.life = p.maxLife;
          p.size = Math.random() * 3 + 1;
          p.speedY = -Math.random() * 2 - 0.5;
        }

        const opacity = (p.life / p.maxLife) * 0.6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${opacity})`;
        ctx.shadowBlur = 15;
        ctx.shadowColor = `hsla(${p.hue}, 100%, 50%, ${opacity * 0.5})`;
        ctx.fill();
        ctx.shadowBlur = 0;
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
        animate={{ color: isFocused ? '#f43f5e' : '#9ca3af', x: isFocused ? 5 : 0 }}
        className="block text-sm font-semibold mb-2 transition-colors"
      >
        {icon && <span className="mr-2">{icon}</span>}
        {label}
        {required && <span className="text-rose-400 ml-1">*</span>}
      </motion.label>
      <motion.div
        animate={{
          boxShadow: isFocused 
            ? '0 0 0 3px rgba(244, 63, 94, 0.2), 0 4px 20px rgba(244, 63, 94, 0.1)'
            : '0 0 0 0px rgba(244, 63, 94, 0)',
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
          className={`w-full px-5 py-3.5 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-rose-500/50 transition-all ${multiline ? 'resize-none leading-relaxed' : ''}`}
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
          ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50'
          : variant === 'secondary'
          ? 'bg-gray-800/50 backdrop-blur-sm text-gray-300 border border-gray-700/50 hover:bg-gray-700/50'
          : 'text-gray-400 hover:text-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            Igniting...
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
// Mood Selector
// =============================================================================
function MoodSelector({ selected, onSelect }) {
  const moods = [
    { key: 'inspirational', label: 'Inspirational', icon: '✨', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    { key: 'motivational', label: 'Motivational', icon: '💪', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    { key: 'uplifting', label: 'Uplifting', icon: '🌈', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
    { key: 'reflective', label: 'Reflective', icon: '🤔', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { key: 'energetic', label: 'Energetic', icon: '⚡', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  ];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-400">Mood / Tone</label>
      <div className="flex flex-wrap gap-2">
        {moods.map((mood) => (
          <motion.button
            key={mood.key}
            type="button"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(mood.key === selected ? '' : mood.key)}
            className={`px-4 py-2 rounded-xl border transition-all flex items-center gap-2 ${
              selected === mood.key
                ? `${mood.bg} ${mood.color} ${mood.border}`
                : 'bg-gray-800/30 text-gray-400 border-gray-700/30 hover:bg-gray-700/30'
            }`}
          >
            <span>{mood.icon}</span>
            <span className="text-sm font-medium">{mood.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// Quote Card Generator
// =============================================================================
function QuoteCard({ quote, author, mood }) {
  const moodStyles = {
    inspirational: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30',
    motivational: 'from-orange-500/20 to-red-500/20 border-orange-500/30',
    uplifting: 'from-pink-500/20 to-rose-500/20 border-pink-500/30',
    reflective: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30',
    energetic: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30',
  };
  const style = moodStyles[mood] || moodStyles.motivational;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-gradient-to-br ${style} backdrop-blur-xl rounded-2xl p-8 border relative overflow-hidden`}
    >
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(244,63,94,0.3), transparent)' }}
      />
      <div className="relative z-10">
        <motion.span
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="text-4xl block mb-4"
        >
          ❝
        </motion.span>
        <p className="text-xl font-serif italic text-gray-100 leading-relaxed mb-4">{quote || 'Your inspirational quote will appear here...'}</p>
        {author && <p className="text-rose-400 font-medium text-sm">— {author}</p>}
      </div>
    </motion.div>
  );
}

// =============================================================================
// Motivation Preview
// =============================================================================
function MotivationPreview({ title, content, quote, quoteAuthor, mood, tags }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {quote && (
        <QuoteCard quote={quote} author={quoteAuthor} mood={mood} />
      )}

      <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="text-3xl"
          >
            🔥
          </motion.div>
          <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-medium border border-rose-500/20">
            {mood ? mood.charAt(0).toUpperCase() + mood.slice(1) : 'Motivation'}
          </span>
        </div>
        <h3 className="text-xl font-bold text-gray-100 mb-3">{title || 'Your Motivation Title'}</h3>
        <p className="text-gray-400 text-sm leading-relaxed mb-4">{content || 'Your motivational story will appear here...'}</p>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <span key={tag} className="px-2 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs border border-rose-500/20">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// =============================================================================
// Main Motivation Create Page
// =============================================================================
export default function NewMotivationPage() {
  const router = useRouter();
  const { user, loading: authLoading, requireAuth } = useAuthUser({ redirectTo: '/motivation/new' });

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [quote, setQuote] = useState('');
  const [quoteAuthor, setQuoteAuthor] = useState('');
  const [mood, setMood] = useState('');
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

    const validation = validateContent({ title, content });
    if (!validation.isValid) {
      setFormError(validation.errors.join(', '));
      return;
    }

    setSubmitting(true);
    try {
      const result = await createMotivation({
        title,
        content,
        quote,
        quote_author: quoteAuthor,
        mood,
        tags,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to post motivation');
      }

      router.push('/community');
    } catch (err) {
      console.error('Create motivation error:', err);
      setFormError(err.message || 'Failed to post motivation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [title, content, quote, quoteAuthor, mood, tags, requireAuth, router]);

  if (authLoading) {
    return (
      <Container className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="rounded-full h-12 w-12 border-b-2 border-rose-500"
        />
      </Container>
    );
  }

  if (!user) return null;

  return (
    <>
      <FireBackground />

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
                className="inline-flex items-center gap-2 text-gray-400 hover:text-rose-400 transition-colors mb-4 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back to Feed
              </motion.span>
            </Link>
            <motion.h1
              className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-orange-400 to-rose-400"
              animate={{ backgroundPosition: ['0%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
              style={{ backgroundSize: '200%' }}
            >
              🔥 Share Motivation
            </motion.h1>
            <p className="text-gray-400 mt-2">Ignite passion in others</p>
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
                label="Title"
                icon="🔥"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Never Give Up on Your Dreams"
                required
              />

              <MoodSelector selected={mood} onSelect={setMood} />

              <MagneticInput
                label="Inspirational Quote (optional)"
                icon="❝"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder='"The only way to do great work is to love what you do."'
              />

              {quote && (
                <MagneticInput
                  label="Quote Author (optional)"
                  icon="✍️"
                  value={quoteAuthor}
                  onChange={(e) => setQuoteAuthor(e.target.value)}
                  placeholder="Steve Jobs"
                />
              )}

              <MagneticInput
                label="Story / Message"
                icon="📖"
                multiline
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your motivational story or message..."
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
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-sm border border-rose-500/20"
                      >
                        {tag}
                        <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1 text-rose-400/60 hover:text-rose-400">×</button>
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
                    placeholder="inspiration, success, mindset"
                    className="flex-1 px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-rose-500/50"
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
                <AnimatedButton type="submit" loading={submitting} disabled={!title.trim() || !content.trim()}>
                  🔥 Ignite Motivation
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
                  <MotivationPreview title={title} content={content} quote={quote} quoteAuthor={quoteAuthor} mood={mood} tags={tags} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Container>
      </main>
    </>
  );
}