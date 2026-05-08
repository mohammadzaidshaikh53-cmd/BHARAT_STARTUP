// lib/marketplace/uiPhysics.js
import { calculateTrendingScore } from './ranking';

export function getCardAttentionLevel(product, feedType) {
    if (feedType === 'trending') {
        const score = calculateTrendingScore(product);
        if (score > 80) return 'high';
        if (score > 50) return 'medium';
        return 'low';
    }
    if (feedType === 'deals' && product.discount_percent >= 50) return 'high';
    if (feedType === 'new-arrivals') {
        const hoursOld = (Date.now() - new Date(product.created_at).getTime()) / 3600000;
        return hoursOld < 6 ? 'high' : 'medium';
    }
    return 'medium';
}

export function getCardElevationClass(attentionLevel) {
    return attentionLevel === 'high'
        ? 'shadow-lg ring-1 ring-orange-200 scale-[1.02]'
        : attentionLevel === 'medium'
            ? 'shadow-md'
            : 'shadow-sm';
}

export function getGlowPulseClass(product) {
    const score = calculateTrendingScore(product);
    return score > 85 ? 'animate-pulse border-2 border-orange-400/50' : '';
}