// components/marketplace/ProductGrid.js
import ProductCard from './ProductCard';

/**
 * Renders a responsive grid of ProductCards.
 *
 * @param {Object[]} products - Array of product objects.
 * @param {string} feedType - One of 'trending', 'new-arrivals', 'deals', 'saved', 'category'.
 * @param {Object[]} [allProducts] - Full list for ranking calculation (optional).
 */
export default function ProductGrid({ products, feedType, allProducts = [] }) {
    if (!products?.length) return null;

    return (
        <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            role="list"
            aria-label="Product listings"
        >
            {products.map(product => (
                <div key={product.id} role="listitem">
                    <ProductCard
                        product={product}
                        feedType={feedType}
                        allProducts={allProducts}
                    />
                </div>
            ))}
        </div>
    );
}