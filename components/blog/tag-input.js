// components/blog/tag-input.js
'use client';

import { useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

export function TagInput({ value = [], onChange, maxTags = 8, placeholder = 'Press Enter to add tag' }) {
  const [input, setInput] = useState('');

  const addTag = useCallback(() => {
    const tag = input.trim().toLowerCase();
    if (tag && !value.includes(tag) && value.length < maxTags) {
      onChange([...value, tag]);
      setInput('');
    }
  }, [input, value, onChange, maxTags]);

  const removeTag = useCallback((tag) => {
    onChange(value.filter(t => t !== tag));
  }, [value, onChange]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm">
            #{tag}
            <button onClick={() => removeTag(tag)} className="hover:text-red-500">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      {value.length < maxTags && (
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={placeholder}
          className="text-sm"
        />
      )}
    </div>
  );
}