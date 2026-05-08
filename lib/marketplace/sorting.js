// lib/marketplace/sorting.js

export function sortByNewest(products) {
    return [...products].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export function sortByDiscount(products) {
    return [...products].sort((a, b) => (b.discount_percent || 0) - (a.discount_percent || 0));
}

export function sortByPopularity(products) {
    return [...products].sort((a, b) => {
        const aPop = (a.product_stats?.views ?? 0) + (a.product_stats?.clicks ?? 0);
        const bPop = (b.product_stats?.views ?? 0) + (b.product_stats?.clicks ?? 0);
        return bPop - aPop;
    });
}