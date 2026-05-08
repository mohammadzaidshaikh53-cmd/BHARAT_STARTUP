// lib/marketplace/ranking.js

/**
 * Safely extract numeric metric from a product (handles nested stats).
 */
const view = (p) => p.product_stats?.views ?? p.views ?? 0;
const click = (p) => p.product_stats?.clicks ?? p.click_count ?? 0;
const inquiry = (p) => p.product_stats?.inquiries ?? p.inquiry_count ?? 0;
const save = (p) => p.product_stats?.saves ?? p.save_count ?? 0;

export function calculateTrendingScore(product) {
    const views = view(product);
    const click_count = click(product);
    const inquiry_count = inquiry(product);
    const save_count = save(product);
    const growth_velocity = product.growth_velocity ?? 1.0;
    const recency_multiplier = product.recency_multiplier ?? 1.0;

    const raw = (
        (views * 0.25) +
        (click_count * 0.20) +
        (inquiry_count * 0.25) +
        (save_count * 0.10) +
        (growth_velocity * 0.20)
    ) * recency_multiplier;

    return Math.round(raw * 100) / 100;
}

export function sortByTrending(products) {
    return [...products].sort((a, b) => calculateTrendingScore(b) - calculateTrendingScore(a));
}

export function getTrendingRank(product, allProducts) {
    const sorted = sortByTrending(allProducts);
    return sorted.findIndex(p => p.id === product.id) + 1;
}