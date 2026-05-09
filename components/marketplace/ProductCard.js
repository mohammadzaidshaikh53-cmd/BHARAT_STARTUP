'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import SaveButton from './SaveButton';
import RankingBadge from './RankingBadge';
import DealCardMetrics from './DealCardMetrics';
import TrendingPhysicsIndicator from './TrendingPhysicsIndicator';
import TrustBadge from '@/components/trust/TrustBadge';
import { getFreshnessBadge } from '@/lib/marketplace/feedMath';
import { getCardAttentionLevel, getCardElevationClass, getGlowPulseClass } from '@/lib/marketplace/uiPhysics';

const springConfig = { type: 'spring', stiffness: 350, damping: 28 };

// Trust score badge helper
function getTrustBadgeForProduct(product) {
  const trustScore = product.trust_score || product.seller?.trust_score || 0;
  const verificationStatus = product.seller?.verification_status || product.verification_status;

  if (verificationStatus === 'verified' && trustScore >= 70) {
    return { label: 'Trusted', icon: '🛡️', color: 'emerald' };
  }
  if (verificationStatus === 'verified') {
    return { label: 'Verified', icon: '✓', color: 'green' };
  }
  if (trustScore >= 60) {
    return { label: 'Active', icon: '⚡', color: 'blue' };
  }
  if (trustScore >= 30) {
    return { label: 'New', icon: '🌱', color: 'amber' };
  }
  return null;
}

// MOQ badge helper
function getMOQBadge(moq) {
  if (!moq) return null;
  return { label: `MOQ: ${moq}`, moq };
}

export default function ProductCard({ product, feedType, allProducts }) {
    const attention = getCardAttentionLevel(product, feedType);
    const elevationClass = getCardElevationClass(attention);
    const glowClass = feedType === 'trending' ? getGlowPulseClass(product) : '';
    const freshnessBadge = feedType === 'new-arrivals' ? getFreshnessBadge(product) : null;
    const trustBadge = getTrustBadgeForProduct(product);
    const moqBadge = getMOQBadge(product.moq || product.min_order_quantity);

    const primaryImage = product.product_images?.find(img => img.is_primary)?.url || product.image_url || null;
    const sellerName = product.seller?.full_name || product.company_name || 'Unknown seller';
    const isVerified = product.seller?.verification_status === 'verified' || product.verification_status === 'verified';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, transition: springConfig }}
            className={`bg-white dark:bg-gray-800/80 rounded-2xl overflow-hidden flex flex-col relative border border-gray-100 dark:border-gray-700/50 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 ${glowClass}`}
        >
            <SaveButton productId={product.id} />

            {/* Image with trust overlay */}
            <Link href={`/products/${product.id}`} className="block relative overflow-hidden">
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={springConfig}
                    className="relative"
                >
                    {primaryImage ? (
                        <Image
                            src={primaryImage}
                            alt={product.name}
                            width={400}
                            height={200}
                            className="w-full h-44 sm:h-48 object-cover"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-44 sm:h-48 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                            <span className="text-4xl opacity-50">📦</span>
                        </div>
                    )}

                    {/* Trust badge overlay */}
                    {trustBadge && (
                        <div className="absolute top-3 left-3">
                            <TrustBadge badge={trustBadge} size="sm" />
                        </div>
                    )}

                    {/* Verified badge */}
                    {isVerified && (
                        <div className="absolute top-3 right-3">
                            <span className="px-2 py-1 bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-lg">
                                ✓ Verified
                            </span>
                        </div>
                    )}

                    {/* Dynamic badges */}
                    {feedType === 'trending' && (
                        <div className="absolute bottom-3 left-3 flex gap-2">
                            <RankingBadge rank={product.trendingRank || '?'} />
                            <TrendingPhysicsIndicator velocity={product.growth_velocity || 0} />
                        </div>
                    )}
                    {feedType === 'new-arrivals' && freshnessBadge && (
                        <div className="absolute bottom-3 left-3">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${freshnessBadge.color}`}>{freshnessBadge.label}</span>
                        </div>
                    )}
                    {feedType === 'deals' && <DealCardMetrics product={product} />}
                </motion.div>
            </Link>

            <div className="p-4 sm:p-5 flex flex-col flex-grow">
                {/* Category & Location */}
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full font-medium">{product.category}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline-flex items-center gap-1">📍 {product.location}</span>
                </div>

                {/* Product name */}
                <Link href={`/products/${product.id}`}>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white line-clamp-2 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                        {product.name}
                    </h3>
                </Link>

                {/* Seller info with trust */}
                <div className="flex items-center gap-2 mt-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-xs font-bold">
                        {sellerName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 truncate flex-1">{sellerName}</span>
                    {moqBadge && (
                        <span className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                            {moqBadge.label}
                        </span>
                    )}
                </div>

                {/* Description */}
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 line-clamp-2 leading-relaxed">
                    {product.description}
                </p>

                {/* Quick stats */}
                {(product.views || product.inquiries) && (
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                        {product.views > 0 && (
                            <span className="flex items-center gap-1">👁 {product.views}</span>
                        )}
                        {product.inquiries > 0 && (
                            <span className="flex items-center gap-1">💬 {product.inquiries}</span>
                        )}
                    </div>
                )}

                {/* Price section */}
                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700/50">
                    {feedType === 'deals' ? (
                        <div className="flex items-baseline gap-3 flex-wrap">
                            <span className="text-2xl font-black text-orange-600 dark:text-orange-400">₹{Number(product.discounted_price).toLocaleString('en-IN')}</span>
                            <span className="text-sm text-gray-400 line-through">₹{Number(product.original_price).toLocaleString('en-IN')}</span>
                            <span className="text-xs bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-2 py-1 rounded-full font-bold">
                                {product.discount_percent}% OFF
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-baseline justify-between">
                            <span className="text-2xl font-black text-gray-900 dark:text-white">
                                ₹{Number(product.price).toLocaleString('en-IN')}
                            </span>
                            <span className="text-xs text-gray-500">per unit</span>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2 mt-3">
                        <Link
                            href={`/products/${product.id}`}
                            className="flex-1 text-center px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors"
                        >
                            View Details
                        </Link>
                        {product.whatsapp && (
                            <a
                                href={`https://wa.me/91${String(product.whatsapp).replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-1"
                            >
                                💬
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}