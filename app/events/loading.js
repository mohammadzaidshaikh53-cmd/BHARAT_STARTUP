export default function EventsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-purple-200 dark:bg-purple-800 rounded-xl" />
        <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
        <p className="text-sm text-gray-400">Loading events...</p>
      </div>
    </div>
  );
}
