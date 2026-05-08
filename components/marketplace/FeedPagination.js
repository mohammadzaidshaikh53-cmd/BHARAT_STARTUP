// components/marketplace/FeedPagination.js

/**
 * "Load more" button with loading state.
 *
 * @param {Object} props
 * @param {boolean} props.hasMore - Whether there are more items.
 * @param {boolean} props.loading - If a fetch is in progress.
 * @param {function} props.onLoadMore - Click handler.
 */
export default function FeedPagination({ hasMore, loading, onLoadMore }) {
    if (!hasMore) return null;

    return (
        <div className="mt-8 text-center">
            <button
                onClick={onLoadMore}
                disabled={loading}
                className="px-8 py-3 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                aria-busy={loading}
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        Loading...
                    </span>
                ) : (
                    'Load More Products'
                )}
            </button>
        </div>
    );
}