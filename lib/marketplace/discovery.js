// lib/marketplace/discovery.js
import { sortByTrending } from './ranking';
import { sortByNewest, sortByDiscount } from './sorting';

export function getFeedProducts(products, feedType, searchTerm = '') {
    let filtered = products;
    if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        );
    }

    switch (feedType) {
        case 'trending':
            return sortByTrending(filtered);
        case 'new-arrivals':
            return sortByNewest(filtered);
        case 'deals':
            return sortByDiscount(filtered.filter(p => p.discount_percent > 0));
        case 'all':
        default:
            return sortByNewest(filtered);
    }
}