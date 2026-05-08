'use client';

export default function Error({ reset }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 text-center border border-red-100 dark:border-red-900/30">
        <div className="text-5xl mb-4">🌪️</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Marketplace Error</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          We couldn't load the marketplace at this moment. This might be a temporary connection issue.
        </p>
        <button
          onClick={() => reset()}
          className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
