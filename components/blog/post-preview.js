// components/blog/post-preview.js
'use client';

import { Avatar } from '@/components/common/Avatar';
import { sanitizeHTML } from '@/lib/utils/sanitize';

export function PostPreview({ title, excerpt, content, tags, imageUrl, author, slug }) {
  const plainContent = content?.replace(/<[^>]*>/g, '') || '';
  const readingTime = Math.ceil(plainContent.length / 500) || 1;

  return (
    <div className="space-y-4">
      {imageUrl && (
        <img src={imageUrl} alt={title} className="w-full h-48 object-cover rounded-xl" />
      )}
      <div>
        <h2 className="text-2xl font-bold">{title || 'Your Title Here'}</h2>
        {slug && <p className="text-sm text-gray-500 font-mono">/blog/{slug}</p>}
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Avatar name={author?.user_metadata?.full_name || author?.email || 'Author'} size={24} />
        <span>{author?.user_metadata?.full_name || author?.email?.split('@')[0] || 'You'}</span>
        <span>•</span>
        <span>{readingTime} min read</span>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <span key={tag} className="px-2 py-1 bg-gray-100 rounded-full text-xs">#{tag}</span>
          ))}
        </div>
      )}
      <div>
        <p className="text-gray-500 text-sm italic">{excerpt || 'No excerpt yet'}</p>
      </div>
      <div className="prose prose-sm max-w-none">
        {content ? <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(content.slice(0, 300) + '…') }} /> : <p className="text-gray-400">Your content will appear here.</p>}
      </div>
    </div>
  );
}