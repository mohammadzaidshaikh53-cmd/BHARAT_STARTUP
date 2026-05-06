// lib/utils/tagHelpers.js

export const MAX_TAGS = 5;

// --------------------------------------
// Normalize single tag
// --------------------------------------
export function normalizeTag(tag) {
  if (!tag || typeof tag !== 'string') return '';

  return tag
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')   // remove special chars
    .replace(/\s+/g, '-')           // spaces → dash
    .replace(/-+/g, '-');           // collapse multiple dashes
}

// --------------------------------------
// Add tag safely
// --------------------------------------
export function addTag(currentTags = [], newTag) {
  const normalized = normalizeTag(newTag);

  if (!normalized) return currentTags;

  // dedupe
  if (currentTags.includes(normalized)) return currentTags;

  // enforce limit
  if (currentTags.length >= MAX_TAGS) return currentTags;

  return [...currentTags, normalized];
}

// --------------------------------------
// Remove tag
// --------------------------------------
export function removeTag(currentTags = [], tagToRemove) {
  const normalized = normalizeTag(tagToRemove);
  return currentTags.filter(tag => tag !== normalized);
}

// --------------------------------------
// Parse input string → tag array
// --------------------------------------
export function parseTagInput(input) {
  if (!input || typeof input !== 'string') return [];

  return Array.from(
    new Set(
      input
        .split(/[,\s]+/)
        .map(normalizeTag)
        .filter(Boolean)
    )
  ).slice(0, MAX_TAGS);
}

// --------------------------------------
// OPTIONAL: ensure tags before submit
// --------------------------------------
export function sanitizeTags(tags = []) {
  return Array.from(
    new Set(tags.map(normalizeTag).filter(Boolean))
  ).slice(0, MAX_TAGS);
}