'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getProductById } from '@/services/productService';

function formatPrice(price) {
    if (!price) return '0';
    return Number(price).toLocaleString('en-IN');
}

function getRelativeTime(timestamp) {
    if (!timestamp) return null;

    const date = new Date(timestamp);

    const diffMs = Date.now() - date;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 1) return 'just now';

    if (diffMinutes < 60) {
        return `${diffMinutes} min ago`;
    }

    if (diffHours < 24) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    }

    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

function formatWhatsAppLink(number) {
    if (!number) return '#';

    let cleaned = String(number).replace(/\D/g, '');

    if (!cleaned.startsWith('91')) {
        cleaned = `91${cleaned}`;
    }

    return `https://wa.me/${cleaned}`;
}

export default function ProductDetailPage() {
    const params = useParams();

    const productId = useMemo(() => {
        if (!params?.id) return null;
        return String(params.id);
    }, [params]);

    const [product, setProduct] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);

    useEffect(() => {
        if (!productId) return;

        let mounted = true;

        const controller = new AbortController();

        async function loadProduct() {
            try {
                setLoading(true);
                setError(null);

                const data = await getProductById(productId, controller.signal);

                if (mounted) {
                    setProduct(data);
                }
            } catch (err) {
                if (err?.name === 'AbortError') return;

                console.error('[ProductDetailPage Error]', err);

                if (mounted) {
                    setError(err?.message || 'Failed to load product.');
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        loadProduct();

        return () => {
            mounted = false;
            controller.abort();
        };
    }, [productId]);

    /**
     * LOADING
     */
    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-orange-200 rounded-xl" />

                    <div className="h-4 w-32 bg-gray-200 rounded" />
                </div>
            </main>
        );
    }

    /**
     * ERROR
     */
    if (error || !product) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Product Not Found
                    </h1>

                    <p className="text-gray-500 mb-4">
                        {error ||
                            'This product does not exist or has been removed.'}
                    </p>

                    <Link
                        href="/marketplace"
                        className="text-orange-600 underline font-medium hover:text-orange-700"
                    >
                        Browse Marketplace
                    </Link>
                </div>
            </main>
        );
    }

    const sellerName =
        product.seller?.full_name ||
        product.seller?.company_name ||
        product.company_name ||
        'Unknown Seller';

    const whatsappNumber =
        product.seller?.whatsapp ||
        product.whatsapp;

    const stats =
        product.product_stats || {};

    return (
        <main className="min-h-screen bg-gray-50 pb-16">

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Link
                    href="/marketplace"
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition"
                >
                    ← Back to Marketplace
                </Link>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">

                    {product.image_url ? (
                        <div className="relative w-full h-64 sm:h-96">
                            <Image
                                src={product.image_url}
                                alt={product.name}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    ) : (
                        <div className="w-full h-64 sm:h-96 bg-gray-100 flex items-center justify-center text-gray-400">
                            📷 No Image Available
                        </div>
                    )}

                    <div className="p-6 sm:p-8">

                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                                {product.category}
                            </span>

                            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                                📍 {product.location || 'Unknown'}
                            </span>
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                            {product.name}
                        </h1>

                        <p className="text-sm text-gray-500 mb-4">
                            🏢 {sellerName}
                        </p>

                        <div className="flex items-baseline gap-3 mb-6">
                            <span className="text-3xl font-bold text-orange-600">
                                ₹{formatPrice(product.price)}
                            </span>
                        </div>

                        {(stats.views > 0 ||
                            stats.clicks > 0 ||
                            stats.inquiries > 0) && (
                                <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600 border-t border-b border-gray-100 py-3">
                                    <span>
                                        👁️ {stats.views || 0} views
                                    </span>

                                    <span>
                                        🖱️ {stats.clicks || 0} clicks
                                    </span>

                                    <span>
                                        💬 {stats.inquiries || 0} inquiries
                                    </span>

                                    <span>
                                        ❤️ {stats.saves || 0} saves
                                    </span>
                                </div>
                            )}

                        {product.description && (
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                    Description
                                </h2>

                                <p className="text-gray-600 leading-relaxed">
                                    {product.description}
                                </p>
                            </div>
                        )}

                        {product.created_at && (
                            <p className="text-xs text-gray-400 mb-4">
                                🆕 Posted{' '}
                                {getRelativeTime(
                                    product.created_at
                                )}
                            </p>
                        )}

                        <Link
                            href={
                                whatsappNumber
                                    ? formatWhatsAppLink(
                                        whatsappNumber
                                    )
                                    : '#'
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full py-3 px-6 text-base font-medium transition ${whatsappNumber
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            Contact via WhatsApp
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}