// components/layout/HomeLayout.js
'use client';

import { cn } from '@/lib/utils';

export function HomeLayout({ children, className, ...props }) {
  return (
    <div className={cn('relative w-full overflow-x-hidden', className)} {...props}>
      {/* Optional global background or container can be added here */}
      {children}
    </div>
  );
}