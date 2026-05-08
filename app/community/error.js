'use client';

export default function Error({ reset }) {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 rounded-3xl shadow-2xl p-8 text-center border border-orange-500/20">
        <div className="text-5xl mb-4">📺</div>
        <h2 className="text-2xl font-bold text-white mb-2">Feed Connection Lost</h2>
        <p className="text-gray-400 mb-8">
          The community signal is weak. Please check your connection or try refreshing the feed.
        </p>
        <button
          onClick={() => reset()}
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95"
        >
          Reconnect to Feed
        </button>
      </div>
    </div>
  );
}
