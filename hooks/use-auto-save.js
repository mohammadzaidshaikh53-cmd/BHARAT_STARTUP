// hooks/use-auto-save.js
import { useState, useEffect, useRef } from 'react';

/**
 * Auto‑saves data at a fixed interval
 * @param {Object} options
 * @param {any} options.data - The data to auto‑save
 * @param {number} options.interval - Interval in milliseconds
 * @param {Function} options.onSave - Async function to perform the save
 * @returns {Object} { isSaving, lastSaved }
 */
export function useAutoSave({ data, interval, onSave }) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const timeoutRef = useRef(null);
  const savedDataRef = useRef(data);

  useEffect(() => {
    // Skip if data hasn't changed
    if (JSON.stringify(savedDataRef.current) === JSON.stringify(data)) return;

    // Debounce the save
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        await onSave(data);
        setLastSaved(new Date().toLocaleTimeString());
        savedDataRef.current = data;
      } catch (error) {
        console.error('Auto‑save failed:', error);
      } finally {
        setIsSaving(false);
      }
    }, interval);

    return () => clearTimeout(timeoutRef.current);
  }, [data, interval, onSave]);

  return { isSaving, lastSaved };
}