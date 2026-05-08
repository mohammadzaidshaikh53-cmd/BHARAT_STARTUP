'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-red-100">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Location Service Error</h2>
        <p className="text-gray-500 mb-8">
          We encountered an issue while trying to fetch local suppliers. This might be due to a network problem or missing profile data.
        </p>
        <button
          onClick={() => reset()}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
