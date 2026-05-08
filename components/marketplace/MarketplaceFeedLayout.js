// components/marketplace/MarketplaceFeedLayout.js
import MarketplaceHeader from './MarketplaceHeader';
import MarketplaceTabs from './MarketplaceTabs';
import MarketplaceSearch from './MarketplaceSearch';
import ProductGrid from './ProductGrid';
import EmptyState from './EmptyState';
import FeedPagination from './FeedPagination';

/**
 * Complete feed layout with search, tabs, product grid, empty state, and pagination.
 *
 * @param {Object} props
 * @param {string} props.title - Page heading.
 * @param {string} [props.subtitle] - Page subtitle.
 * @param {Object[]} [props.stats] - Stats chips.
 * @param {string} props.feedType - 'trending'|'new-arrivals'|'deals'|'saved'.
 * @param {Object[]} props.products - Current page products.
 * @param {Object[]} [props.allProducts] - Full product list for ranking (optional).
 * @param {string} [props.searchTerm] - Current search term (for clear button).
 * @param {function} props.onSearch - Search callback.
 * @param {boolean} props.loading - True while data is fetching.
 * @param {string|null} props.error - Error message if fetch failed.
 * @param {boolean} props.hasMore - Whether more products exist.
 * @param {function} props.onLoadMore - Load more callback.
 * @param {Object} [props.emptyProps] - Props for EmptyState when no products: { title, message, actionLink?, actionText? }.
 */
export default function MarketplaceFeedLayout({
    title,
    subtitle,
    stats,
    feedType,
    products,
    allProducts = [],
    searchTerm,
    onSearch,
    loading,
    error,
    hasMore,
    onLoadMore,
    emptyProps = {},
}) {
    const showSkeleton = loading && products.length === 0;
    const showError = error && !loading;
    const showEmpty = !loading && !error && products.length === 0;
    const showGrid = !loading && !error && products.length > 0;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <MarketplaceHeader title={title} subtitle={subtitle} stats={stats} />
            <MarketplaceTabs />
            <MarketplaceSearch
                onSearch={onSearch}
                placeholder={`Search in ${title}...`}
                isLoading={loading}
            />

            {/* Loading skeleton */}
            {showSkeleton && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-2xl shadow-md overflow-hidden h-80 animate-pulse"
                        >
                            <div className="w-full h-40 bg-gray-200" />
                            <div className="p-5 space-y-3">
                                <div className="h-5 bg-gray-200 rounded w-3/4" />
                                <div className="h-3 bg-gray-200 rounded w-1/2" />
                                <div className="h-3 bg-gray-200 rounded w-full" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Error state */}
            {showError && (
                <div className="min-h-[40vh] flex flex-col items-center justify-center text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h3>
                    <p className="text-gray-500 mb-6 max-w-md">{error}</p>
                    <button
                        onClick={() => onSearch(searchTerm || '')}
                        className="px-6 py-2.5 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Empty state */}
            {showEmpty && (
                <EmptyState
                    title={emptyProps.title || 'No products found'}
                    message={emptyProps.message || 'Try adjusting your search or filters.'}
                    actionLink={emptyProps.actionLink}
                    actionText={emptyProps.actionText}
                />
            )}

            {/* Product grid */}
            {showGrid && (
                <>
                    <ProductGrid
                        products={products}
                        feedType={feedType}
                        allProducts={allProducts}
                    />
                    <FeedPagination
                        hasMore={hasMore}
                        loading={loading}
                        onLoadMore={onLoadMore}
                    />
                </>
            )}
        </div>
    );
}