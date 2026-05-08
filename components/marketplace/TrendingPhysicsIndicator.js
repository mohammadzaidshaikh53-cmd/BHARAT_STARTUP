// components/marketplace/TrendingPhysicsIndicator.js

/**
 * Visual indicator of growth momentum.
 *
 * @param {Object} props
 * @param {number} props.velocity - growth_velocity value.
 */
export default function TrendingPhysicsIndicator({ velocity = 0 }) {
    const level = velocity > 2.5 ? 'high' : velocity > 1.5 ? 'medium' : 'low';
    const config = {
        high: { bg: 'bg-green-100', text: 'text-green-700', ring: 'ring-green-400' },
        medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', ring: 'ring-yellow-400' },
        low: { bg: 'bg-gray-100', text: 'text-gray-600', ring: 'ring-gray-300' },
    };
    const { bg, text, ring } = config[level];

    return (
        <span
            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${bg} ${text}`}
        >
            <span
                className={`inline-block w-2 h-2 rounded-full animate-pulse ring-1 ${ring}`}
                style={{ animationDuration: level === 'high' ? '0.8s' : '1.5s' }}
            />
            Momentum {velocity.toFixed(1)}x
        </span>
    );
}