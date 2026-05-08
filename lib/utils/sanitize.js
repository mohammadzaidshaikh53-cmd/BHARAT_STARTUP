// lib/utils/sanitize.js — HTML sanitization wrapper
// Uses isomorphic-dompurify (already in package.json)

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content, stripping dangerous tags and attributes
 */
export function sanitizeHTML(dirty) {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
      'span', 'div', 'img', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'class', 'id'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Strip all HTML tags, returning plain text
 */
export function stripHTML(dirty) {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });
}

/**
 * Sanitize user input for database storage (prevent XSS in text fields)
 */
export function sanitizeText(text) {
  if (!text) return '';
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitize filename for storage uploads
 */
export function sanitizeFilename(filename) {
  if (!filename) return `file_${Date.now()}`;
  // Remove path traversal, special chars; keep extension
  const ext = filename.split('.').pop()?.toLowerCase() || 'bin';
  const name = filename
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 50);
  return `${Date.now()}_${name}.${ext}`;
}
