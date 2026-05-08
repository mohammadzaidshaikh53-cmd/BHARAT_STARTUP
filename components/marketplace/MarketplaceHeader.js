// components/marketplace/MarketplaceHeader.js
import MarketplaceStats from './MarketplaceStats';

/**
 * Unified header for all marketplace feeds.
 *
 * @param {Object} props
 * @param {string} props.title - Main heading.
 * @param {string} [props.subtitle] - Optional subtitle.
 * @param {Object[]} [props.stats] - Array of { label, value } for stats.
 */
export default function MarketplaceHeader({ title, subtitle, stats }) {
    return (
        <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
            {subtitle && <p className="mt-1 text-gray-600">{subtitle}</p>}
            {stats?.length > 0 && (
                <div className="mt-4">
                    <MarketplaceStats stats={stats} />
                </div>
            )}
        </header>
    );
}