// components/ui/LoadingSpinner.js (verify – no changes, just ensure it exists)
'use client';

export function LoadingSpinner() {
  return (
    <div role="status" className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      <span className="sr-only">Loading</span>
    </div>
  );
}