import { cn } from '@/lib/utils';

export function Container({ children, className, maxWidth = '7xl', ...props }) {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };
  return (
    <div
      className={cn('mx-auto w-full px-4 sm:px-6', maxWidthClasses[maxWidth], className)}
      {...props}
    >
      {children}
    </div>
  );
}