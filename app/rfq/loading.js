export default function RFQLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-blue-200 dark:bg-blue-800 rounded-xl" />
        <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
        <p className="text-sm text-gray-400">Loading RFQ marketplace...</p>
      </div>
    </div>
  );
}
