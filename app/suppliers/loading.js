export default function SuppliersLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-emerald-200 dark:bg-emerald-800 rounded-xl" />
        <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
        <p className="text-sm text-gray-400">Loading suppliers...</p>
      </div>
    </div>
  );
}
