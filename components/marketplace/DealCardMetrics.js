// components/marketplace/DealCardMetrics.js

/**
 * Renders a discount badge with urgency level.
 *
 * @param {Object} product - Must contain discount_percent (number).
 */
export default function DealCardMetrics({ product }) {
    const discount = product.discount_percent || 0;
    if (discount <= 0) return null;

    const urgency = discount >= 50 ? 'high' : discount >= 30 ? 'medium' : 'low';
    const styles = {
        high: 'bg-red-100 text-red-700 border-red-200',
        medium: 'bg-orange-100 text-orange-700 border-orange-200',
        low: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    };

    return (
        <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${styles[urgency]}`}
        >
            {urgency === 'high' ? '🔥' : urgency === 'medium' ? '💸' : '🏷️'}
            {discount}% OFF
        </span>
    );
}