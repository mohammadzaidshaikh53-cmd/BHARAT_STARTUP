// lib/marketplace/feedMath.js

export function getFreshnessScore(product) {
    const hoursAgo = (Date.now() - new Date(product.created_at).getTime()) / (1000 * 60 * 60);
    return Math.max(0, 100 - hoursAgo * 1.5);
}

export function getFreshnessBadge(product) {
    const score = getFreshnessScore(product);
    if (score > 95) return { label: 'Just Arrived', color: 'bg-green-100 text-green-700' };
    if (score > 85) return { label: 'Hot New', color: 'bg-orange-100 text-orange-700' };
    if (score > 70) return { label: 'Recently Added', color: 'bg-blue-100 text-blue-700' };
    return null;
}

export function getDiscountMetrics(product) {
    const discount = product.discount_percent || 0;
    if (discount >= 50) return { urgency: 'high', badge: '🔥 Hot Deal' };
    if (discount >= 30) return { urgency: 'medium', badge: '💸 Great Deal' };
    if (discount > 0) return { urgency: 'low', badge: '💰 Offer' };
    return null;
}