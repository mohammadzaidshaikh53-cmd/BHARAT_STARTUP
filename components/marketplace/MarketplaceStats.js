// components/marketplace/MarketplaceStats.js

/**
 * Displays a row of stat chips.
 *
 * @param {Object} props
 * @param {Object[]} props.stats - Array of { label, value }.
 */
export default function MarketplaceStats({ stats }) {
    if (!stats || stats.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-3" aria-label="Marketplace statistics">
            {stats.map((stat, idx) => (
                <div
                    key={idx}
                    className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100 text-sm text-gray-700"
                >
                    <span className="font-semibold text-gray-900">{stat.value}</span>
                    <span className="text-gray-500">{stat.label}</span>
                </div>
            ))}
        </div>
    );
}