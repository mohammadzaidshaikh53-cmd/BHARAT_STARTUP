import Image from 'next/image';
import Link from 'next/link';
import SaveButton from './SaveButton';
import RankingBadge from './RankingBadge';
import DealCardMetrics from './DealCardMetrics';
import TrendingPhysicsIndicator from './TrendingPhysicsIndicator';
import { getFreshnessBadge } from '@/lib/marketplace/feedMath';
import { getCardAttentionLevel, getCardElevationClass, getGlowPulseClass } from '@/lib/marketplace/uiPhysics';

export default function ProductCard({ product, feedType, allProducts }) {
    const attention = getCardAttentionLevel(product, feedType);
    const elevationClass = getCardElevationClass(attention);
    const glowClass = feedType === 'trending' ? getGlowPulseClass(product) : '';

    const freshnessBadge = feedType === 'new-arrivals' ? getFreshnessBadge(product) : null;

    // Build primary image from the new nested product_images array
    const primaryImage = product.product_images?.find(img => img.is_primary)?.url || product.image_url || null;

    // Seller name: prefer joined seller data, fallback to company_name
    const sellerName = product.seller?.full_name || product.company_name || 'Unknown seller';

    return (
        <div className={`bg-white rounded-2xl overflow-hidden flex flex-col relative transition-all duration-300 hover:-translate-y-1 ${elevationClass} ${glowClass}`}>
            <SaveButton productId={product.id} />

            <Link href={`/products/${product.id}`} className="block relative">
                {primaryImage ? (
                    <Image
                        src={primaryImage}
                        alt={product.name}
                        width={400}
                        height={160}
                        className="w-full h-40 object-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400">📷 No image</div>
                )}
            </Link>

            <div className="p-5 flex flex-col flex-grow">
                {/* Dynamic badges */}
                <div className="flex flex-wrap gap-2 mb-2">
                    {feedType === 'trending' && (
                        <>
                            <RankingBadge rank={product.trendingRank || '?'} />
                            <TrendingPhysicsIndicator velocity={product.growth_velocity || 0} />
                        </>
                    )}
                    {feedType === 'new-arrivals' && freshnessBadge && (
                        <span className={`text-xs px-2 py-1 rounded-full ${freshnessBadge.color}`}>{freshnessBadge.label}</span>
                    )}
                    {feedType === 'deals' && <DealCardMetrics product={product} />}
                </div>

                <Link href={`/products/${product.id}`} className="hover:underline">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{product.name}</h3>
                </Link>
                {sellerName && (
                    <p className="text-xs text-gray-500 mt-1">🏢 {sellerName}</p>
                )}
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{product.description}</p>

                <div className="flex flex-wrap gap-2 mt-3 text-xs">
                    <span className="bg-gray-100 px-2 py-1 rounded-full">{product.category}</span>
                    <span className="bg-gray-100 px-2 py-1 rounded-full">📍 {product.location}</span>
                </div>

                <div className="mt-auto">
                    {feedType === 'deals' ? (
                        <div className="flex items-baseline gap-2 mt-4">
                            <span className="text-2xl font-bold text-orange-600">₹{product.discounted_price}</span>
                            <span className="text-sm text-gray-400 line-through">₹{product.original_price}</span>
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{product.discount_percent}% off</span>
                        </div>
                    ) : (
                        <div className="mt-4">
                            <span className="text-2xl font-bold text-orange-600">₹{product.price}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}