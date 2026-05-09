// app/marketplace/product/[id]/page.js
'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useProductDetail } from '@/lib/queries/productQueries';

// ─── Helpers (same style as category page) ─────────────────────────
const formatPrice = (price) => {
    if (!price) return '0';
    return Number(price).toLocaleString('en-IN');
};

const getRelativeTime = (timestamp) => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
};

const getVerificationBadge = (status) => {
    if (!status || status === 'none') return null;
    const styles = {
        verified: 'bg-green-100 text-green-700',
        pending: 'bg-yellow-100 text-yellow-700',
        rejected: 'bg-red-100 text-red-700',
    };
    const labels = {
        verified: '✅ Verified',
        pending: '⏳ Pending',
        rejected: '❌ Rejected',
    };
    return (
        <span className={`${styles[status] || 'bg-gray-100 text-gray-600'} text-xs px-2 py-0.5 rounded-full`}>
            {labels[status] || status}
        </span>
    );
};

const getLocationColor = (location) => {
    if (!location) return 'bg-gray-100 text-gray-800';
    const colors = [
        'bg-purple-100 text-purple-800',
        'bg-blue-100 text-blue-800',
        'bg-green-100 text-green-800',
        'bg-indigo-100 text-indigo-800',
        'bg-yellow-100 text-yellow-800',
        'bg-pink-100 text-pink-800',
        'bg-orange-100 text-orange-800',
        'bg-teal-100 text-teal-800',
    ];
    let hash = 0;
    for (let i = 0; i < location.length; i++) {
        hash = location.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

const formatWhatsAppLink = (number) => {
    if (!number) return '#';
    let cleaned = String(number).replace(/\D/g, '');
    if (!cleaned.startsWith('91')) cleaned = `91${cleaned}`;
    return `https://wa.me/${cleaned}`;
};

// ─── Skeleton Loader ─────────────────────────────────────────────
const ProductSkeleton = () => (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 animate-pulse space-y-6">
        <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="h-64 bg-gray-200 rounded w-full" />
            <div className="mt-6 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-2/3" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-8 bg-gray-200 rounded w-1/4 mt-4" />
                <div className="h-10 bg-gray-200 rounded-full w-full mt-6" />
            </div>
        </div>
    </div>
);

// ─── Main Page ─────────────────────────────────────────────────────
export default function ProductDetailPage() {
    const params = useParams();
    const productId = params?.id;

    const { data: product, isLoading, error } = useProductDetail(productId);

    // ─── Rendering ─────────────────────────────────────────────────
    if (isLoading) return <ProductSkeleton />;

    if (error) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {error === 'Product not found' ? 'Product Not Found' : 'Something went wrong'}
                    </h2>
                    <p className="text-gray-500 mb-4">
                        {error === 'Product not found'
                            ? 'This product may have been removed or the link is incorrect.'
                            : error}
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Link
                            href="/marketplace/category/all"
                            className="px-6 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition"
                        >
                            Browse Marketplace
                        </Link>
                        {error !== 'Product not found' && (
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-2 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition"
                            >
                                Retry
                            </button>
                        )}
                    </div>
                </div>
            </main>
        );
    }

    if (!product) return null; // defensive

    return (
        <main className="min-h-screen bg-gray-50 pb-24">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <nav className="text-sm text-gray-500 mb-4">
                    <Link href="/marketplace/category/all" className="hover:text-orange-600">
                        Marketplace
                    </Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900">{product.name}</span>
                </nav>

                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                    {/* Product Image */}
                    {product.image_url ? (
                        <div className="w-full h-64 sm:h-96 relative">
                            <Image
                                src={product.image_url}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 800px"
                                priority
                            />
                        </div>
                    ) : (
                        <div className="w-full h-64 sm:h-96 bg-gray-100 flex items-center justify-center text-gray-400 text-6xl">
                            📷
                        </div>
                    )}

                    <div className="p-6 sm:p-8">
                        {/* Title & Verification */}
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                                {product.name}
                            </h1>
                            {getVerificationBadge(product.verification_status)}
                        </div>

                        {/* Company & Location */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
                            {product.company_name && (
                                <span className="flex items-center gap-1">
                                    🏢 {product.company_name}
                                </span>
                            )}
                            {product.location && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLocationColor(product.location)}`}>
                                    📍 {product.location}
                                </span>
                            )}
                            {product.created_at && (
                                <span className="text-green-600">
                                    🆕 {getRelativeTime(product.created_at)}
                                </span>
                            )}
                        </div>

                        {/* Price */}
                        <div className="mb-6">
                            <span className="text-4xl font-bold text-orange-600">
                                ₹{formatPrice(product.price)}
                            </span>
                            {product.price_label && (
                                <span className="text-sm text-gray-500 ml-2">/ {product.price_label}</span>
                            )}
                        </div>

                        {/* Description */}
                        {product.description && (
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {product.description}
                                </p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 mt-8">
                            {/* WhatsApp Contact */}
                            {product.whatsapp ? (
                                <a
                                    href={formatWhatsAppLink(product.whatsapp)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-full transition flex-1"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.588 2.014.896 3.149.896h.002c3.18 0 5.767-2.586 5.768-5.766.001-3.18-2.585-5.767-5.766-5.768z" />
                                    </svg>
                                    Chat on WhatsApp
                                </a>
                            ) : (
                                <button
                                    disabled
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-400 font-medium rounded-full flex-1 cursor-not-allowed"
                                >
                                    No Contact Available
                                </button>
                            )}

                            {/* In-app Inquiry (coming soon placeholder) */}
                            <button
                                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-full transition"
                                onClick={() => {
                                    // TODO: Connect to chat system when ready
                                    alert('In-app inquiry coming soon! For now, use WhatsApp.');
                                }}
                            >
                                Send Inquiry
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}