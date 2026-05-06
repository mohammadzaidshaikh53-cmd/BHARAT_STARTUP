'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'sonner';
import { Container } from '@/components/ui/Container';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { TagInput } from '@/components/blog/tag-input';

// ------------------------------------------------------------------
// CRITICAL: This MUST be a browser-only Supabase client.
// If your @/lib/supabase file creates a server client or accesses
// cookies during import, it will crash during SSR/RSC streaming.
// ------------------------------------------------------------------
import { supabase } from '@/lib/supabase';

const MAX_EXCERPT_LENGTH = 160;

/* ------------------------------------------------------------------ */
/*  FIXED AUTO-SAVE HOOK (inline so we control the closure)           */
/* ------------------------------------------------------------------ */
function useAutoSave({ data, interval = 5000, onSave, enabled = true }) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const dataRef = useRef(data);
  const onSaveRef = useRef(onSave);
  const enabledRef = useRef(enabled);

  useEffect(() => { dataRef.current = data; }, [data]);
  useEffect(() => { onSaveRef.current = onSave; }, [onSave]);
  useEffect(() => { enabledRef.current = enabled; }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const timer = setInterval(async () => {
      if (!enabledRef.current) return;

      const liveData = dataRef.current;
      const hasContent = liveData.title?.trim() || liveData.content?.trim();
      if (!hasContent) return;

      setIsSaving(true);
      try {
        await onSaveRef.current(liveData);
        setLastSaved(new Date());
      } catch (err) {
        console.warn('Auto-save failed:', err);
      } finally {
        setIsSaving(false);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [interval, enabled]);

  return { isSaving, lastSaved };
}

/* ------------------------------------------------------------------ */
/*  MAIN EDITOR COMPONENT                                               */
/* ------------------------------------------------------------------ */
export function BlogEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ----------------------------------------------------------------
  // State
  // ----------------------------------------------------------------
  const [user, setUser] = useState(null);
  const [postId, setPostId] = useState(null);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [tags, setTags] = useState([]);
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [loading, setLoading] = useState(true);

  // ----------------------------------------------------------------
  // Refs (prevent stale closures & infinite loops)
  // ----------------------------------------------------------------
  const titleRef = useRef(null);
  const postIdRef = useRef(postId);
  const userRef = useRef(user);
  const excerptManuallyEdited = useRef(false);

  useEffect(() => { postIdRef.current = postId; }, [postId]);
  useEffect(() => { userRef.current = user; }, [user]);

  // Stable draft slug generated ONCE per session
  const draftSlugRef = useRef(
    `draft-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  );

  // ----------------------------------------------------------------
  // Init: Auth + Load existing draft
  // ----------------------------------------------------------------
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data: { session }, error: sessErr } =
          await supabase.auth.getSession();

        if (sessErr) throw sessErr;

        if (!session?.user) {
          router.replace(`/login?redirect=${encodeURIComponent('/blog/new')}`);
          return;
        }

        if (!mounted) return;
        setUser(session.user);

        const draftId = searchParams.get('draft');
        if (draftId) {
          const { data: draft, error: draftErr } = await supabase
            .from('content_posts')
            .select('*')
            .eq('id', draftId)
            .eq('author_id', session.user.id)
            .single();

          if (draftErr) {
            console.error('Draft load error:', draftErr);
            toast.error('Could not load draft.');
          } else if (draft) {
            setPostId(draft.id);
            setTitle(draft.title || '');
            setExcerpt(draft.excerpt || '');
            setContent(draft.content || '');
            setTags(draft.tags || []);
            setFeaturedImage(draft.featured_image || '');
            if (draft.excerpt) excerptManuallyEdited.current = true;
          }
        }
      } catch (err) {
        console.error('Editor init error:', err);
        toast.error('Failed to initialize editor.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------------------------------------------------
  // Auto-save callback (uses refs, so it never goes stale)
  // ----------------------------------------------------------------
  const handleAutoSave = useCallback(async (data) => {
    const currentUser = userRef.current;
    const currentPostId = postIdRef.current;

    if (!currentUser) return;

    const payload = {
      content_type: 'blog',
      title: data.title?.trim() || '',
      content: data.content || '',
      excerpt: data.excerpt?.trim() || '',
      tags: data.tags || [],
      featured_image: data.featuredImage || null,
      author_id: currentUser.id,
      status: 'published',
published_at: new Date().toISOString(),status: 'draft',
    };

    // CRITICAL: Always provide a slug (required column)
    if (currentPostId) {
      payload.id = currentPostId;
      // For existing drafts, keep the existing slug (don't change it)
      // We need to fetch the current slug? But we don't have it here.
      // Safer: let the upsert keep the existing slug; we won't overwrite it.
      // However, to avoid "null" violation, we must send a slug if updating.
      // We can't fetch it here cheaply. Better to always generate a new slug for drafts.
      // But that would violate UNIQUE if we update. So we'll send the old slug only if we know it.
      // Simpler: send the existing slug if we have it in state? We don't store it.
      // We'll modify to store slug in state.
    } else {
      payload.slug = draftSlugRef.current;
    }

    // Since we might be updating an existing draft without a slug in the payload,
    // we need to include the current slug from the database. We'll fetch it if missing.
    if (currentPostId && !payload.slug) {
      // Fetch the current slug for this post
      const { data: existing, error: fetchErr } = await supabase
        .from('content_posts')
        .select('slug')
        .eq('id', currentPostId)
        .single();
      if (fetchErr) {
        console.error('Failed to fetch existing slug:', fetchErr);
        // Fallback: generate a new temporary slug (might cause duplicate if already exists, but rare)
        payload.slug = `draft-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      } else {
        payload.slug = existing.slug;
      }
    }

    try {
      const { data: result, error } = await supabase
        .from('content_posts')
        .upsert(payload, { onConflict: 'id' })
        .select('id')
        .single();

      if (error) {
        console.error('Auto-save error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          status: error.status,
        });
        throw error;
      }

      if (result?.id && !currentPostId) {
        setPostId(result.id);
      }
      // Success
    } catch (err) {
      console.error('Auto-save failed:', err);
      throw err;
    }
  }, []);

  const { isSaving, lastSaved } = useAutoSave({
    data: { title, content, excerpt, tags, featuredImage },
    interval: 5000,
    onSave: handleAutoSave,
    enabled: !!user && !loading,
  });

  // ----------------------------------------------------------------
  // Auto-generate excerpt once when content first appears
  // ----------------------------------------------------------------
  useEffect(() => {
    if (
      content &&
      !excerpt &&
      !excerptManuallyEdited.current
    ) {
      const plain = content.replace(/<[^>]*>/g, '');
      const snippet = plain.slice(0, MAX_EXCERPT_LENGTH).trim();
      if (snippet) {
        setExcerpt(
          snippet + (plain.length > MAX_EXCERPT_LENGTH ? '…' : '')
        );
      }
    }
  }, [content, excerpt]);

  // ----------------------------------------------------------------
  // Warn on unsaved navigation
  // ----------------------------------------------------------------
  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (isSaving || title || content) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isSaving, title, content]);

  // ----------------------------------------------------------------
  // Derived values
  // ----------------------------------------------------------------
  const displaySlug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'untitled';

  // ----------------------------------------------------------------
  // Image upload
  // ----------------------------------------------------------------
  const handleImageUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    const currentUser = userRef.current;
    if (!file || !currentUser) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${currentUser.id}.${ext}`;

    try {
      const { error: upErr } = await supabase.storage
        .from('blog-images')
        .upload(`featured/${fileName}`, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (upErr) throw upErr;

      const { data: urlData } = supabase.storage
        .from('blog-images')
        .getPublicUrl(`featured/${fileName}`);

      setFeaturedImage(urlData.publicUrl);
      toast.success('Image uploaded');
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Upload failed: ' + err.message);
    }
  }, []);

  // ----------------------------------------------------------------
  // Manual save draft
  // ----------------------------------------------------------------
  const handleManualSave = async () => {
    if (!user) return;
    try {
      await handleAutoSave({ title, content, excerpt, tags, featuredImage });
      toast.success('Draft saved');
    } catch {
      toast.error('Failed to save draft');
    }
  };

  // ----------------------------------------------------------------
  // Publish
  // ----------------------------------------------------------------
  const handlePublish = useCallback(async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      titleRef.current?.focus();
      return;
    }

    const currentUser = userRef.current;
    const currentPostId = postIdRef.current;

    if (!currentUser) {
      toast.error('You must be logged in to publish');
      return;
    }

    setPublishing(true);

    try {
      const baseSlug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'untitled';

      const finalSlug = `${baseSlug}-${Date.now()}`;

      const finalExcerpt =
        excerpt.trim() ||
        content
          .replace(/<[^>]*>/g, '')
          .slice(0, MAX_EXCERPT_LENGTH)
          .trim() + '…';

      const payload = {
        content_type: 'blog',
        title: title.trim(),
        content: content.trim(),
        excerpt: finalExcerpt,
        slug: finalSlug,
        tags,
        featured_image: featuredImage || null,
        author_id: currentUser.id,
        status: 'published',
        published_at: new Date().toISOString(),
      };

      if (currentPostId) payload.id = currentPostId;

      const { error } = await supabase
        .from('content_posts')
        .upsert(payload, { onConflict: 'id' });

      if (error) throw error;

      try {
        await supabase.rpc('refresh_community_feed');
      } catch (rpcErr) {
        console.warn('refresh_community_feed RPC not available:', rpcErr);
      }

      toast.success('Post published!');
      router.push(`/blog/${finalSlug}`);
      router.refresh();
    } catch (err) {
      console.error('Publish error:', err);
      toast.error(err.message || 'Failed to publish post');
    } finally {
      setPublishing(false);
    }
  }, [title, content, excerpt, tags, featuredImage, router]);

  // ----------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------
  if (loading) {
    return (
      <Container className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
      </Container>
    );
  }

  if (!user) return null;

  return (
    <>
      <Toaster position="top-right" richColors />
      <Container className="py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold">Write a Post</h1>
              <p className="text-gray-500 mt-1">
                Share your ideas with the community
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.back()}
                disabled={publishing}
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleManualSave}
                disabled={publishing || isSaving}
              >
                {isSaving ? 'Saving…' : 'Save Draft'}
              </Button>
              <Button
                onClick={handlePublish}
                disabled={publishing || isSaving}
              >
                {publishing ? 'Publishing…' : 'Publish Now'}
              </Button>
            </div>
          </div>

          <div className="space-y-8">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                ref={titleRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Your post title"
                className="text-xl font-semibold"
                disabled={publishing}
              />
              {displaySlug && (
                <p className="text-xs text-gray-400 mt-1">
                  Slug preview: /blog/{displaySlug}
                </p>
              )}
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Featured Image (optional)
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={publishing}
              />
              {featuredImage && (
                <div className="mt-2 relative inline-block">
                  <img
                    src={featuredImage}
                    alt="Featured preview"
                    className="rounded-lg max-h-48 object-cover border"
                  />
                  <button
                    type="button"
                    onClick={() => setFeaturedImage('')}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 shadow"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-1">Tags</label>
              <TagInput
                value={tags}
                onChange={setTags}
                disabled={publishing}
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Content <span className="text-red-500">*</span> (HTML supported)
              </label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={14}
                className="font-mono"
                placeholder="Write your content here... You can use HTML tags like <h2>, <strong>, etc."
                disabled={publishing}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {content.replace(/<[^>]*>/g, '').length} chars
              </p>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Excerpt{' '}
                {!excerptManuallyEdited.current && (
                  <span className="text-gray-400 font-normal">
                    (auto-generated)
                  </span>
                )}
              </label>
              <Textarea
                value={excerpt}
                onChange={(e) => {
                  setExcerpt(e.target.value);
                  excerptManuallyEdited.current = true;
                }}
                rows={3}
                className="bg-gray-50"
                placeholder="Brief summary of your post..."
                disabled={publishing}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {excerpt.length}/{MAX_EXCERPT_LENGTH}
              </p>
            </div>

            {/* Status footer */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-400">
                {postId ? `Draft ID: ${postId}` : 'New draft'}
              </div>
              <div className="text-right text-xs text-gray-400">
                {isSaving
                  ? 'Saving draft…'
                  : lastSaved
                  ? `Last saved: ${lastSaved.toLocaleTimeString()}`
                  : 'Unsaved changes'}
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </>
  );
}