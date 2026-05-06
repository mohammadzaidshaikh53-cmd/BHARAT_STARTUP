// lib/utils.js
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  // First, generate classes using clsx (handles arrays, objects, strings)
  const classString = clsx(inputs);
  // Then merge Tailwind classes properly (removes duplicates and resolves conflicts)
  return twMerge(classString);
}