// utils/slugify.js

// --------------------------------------
// Base slugify (clean + safe)
// --------------------------------------
export function slugify(text) {
  if (!text || typeof text !== 'string') return 'untitled';

  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// --------------------------------------
// Type prefixes (VERY IMPORTANT)
// --------------------------------------
const TYPE_PREFIX = {
  blog: 'blog',
  idea: 'idea',
  question: 'q',
  discussion: 'd',
  biography: 'bio',
  motivation: 'mot',
};

// --------------------------------------
// Generate unique slug (TYPE AWARE)
// --------------------------------------
export function generateUniqueSlug(title, type = 'blog') {
  const base = slugify(title) || 'untitled';

  const prefix = TYPE_PREFIX[type] || 'post';

  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 6);

  return `${prefix}-${base}-${timestamp}-${random}`;
}

// --------------------------------------
// OPTIONAL: Extract type from slug
// --------------------------------------
export function getTypeFromSlug(slug) {
  if (!slug) return 'blog';

  if (slug.startsWith('idea-')) return 'idea';
  if (slug.startsWith('blog-')) return 'blog';
  if (slug.startsWith('q-')) return 'question';
  if (slug.startsWith('d-')) return 'discussion';
  if (slug.startsWith('bio-')) return 'biography';
  if (slug.startsWith('mot-')) return 'motivation';

  return 'blog';
}