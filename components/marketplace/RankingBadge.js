// components/marketplace/RankingBadge.js

/**
 * Displays trending position badge.
 *
 * @param {Object} props
 * @param {number|string} props.rank - Rank number.
 */
export default function RankingBadge({ rank }) {
    return (
        <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
            🔥 Trending #{rank}
        </span>
    );
}