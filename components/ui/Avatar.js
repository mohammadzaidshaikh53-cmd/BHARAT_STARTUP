'use client';
import { cn } from '@/lib/utils';

export function Avatar({ src, alt, name, size = 32, className }) {
  const initials = name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';
  const colors = [
    'bg-orange-100 text-orange-700',
    'bg-blue-100 text-blue-700',
    'bg-emerald-100 text-emerald-700',
    'bg-purple-100 text-purple-700',
    'bg-pink-100 text-pink-700',
  ];
  const colorIndex = (name?.length || 0) % colors.length;
  return (
    <div
      className={cn('relative rounded-full overflow-hidden flex-shrink-0', className)}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img src={src} alt={alt || name} className="w-full h-full object-cover" />
      ) : (
        <div className={cn('w-full h-full flex items-center justify-center text-xs font-semibold', colors[colorIndex])}>
          {initials}
        </div>
      )}
    </div>
  );
}