// app/marketplace/category/[slug]/page.js
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

import { getIndustryContext } from '@/services/categoryService';
import { fetchProducts as fetchProductsFromService } from '@/services/productService';

const PAGE_SIZE = 20;
const MAX_RESULTS = 100;

const VERIFICATION_STYLES = {
  verified: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  rejected: 'bg-red-100 text-red-700',
};

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
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  }

  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
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

  if (!cleaned.startsWith('91')) {
    cleaned = `91${cleaned}`;
  }

  return `https://wa.me/${cleaned}`;
};

const prepareSearchQuery = (raw) => {
  if (!raw.trim()) return null;

  const cleaned = raw.replace(/[&|!():*]/g, ' ').trim();

  if (!cleaned) return null;

  const words = cleaned
    .split(/\s+/)
    .filter((w) => w.length > 0);

  return words.join(' & ');
};

const ProductSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col animate-pulse">
    <div className="w-full h-40 bg-gray-200" />

    <div className="p-5 space-y-3">
      <div className="h-5 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="h-3 bg-gray-200 rounded w-full" />

      <div className="flex gap-2">
        <div className="h-5 bg-gray-200 rounded w-16" />
        <div className="h-5 bg-gray-200 rounded w-20" />
      </div>

      <div className="h-8 bg-gray-200 rounded w-1/3" />
      <div className="h-10 bg-gray-200 rounded-full w-full" />
    </div>
  </div>
);

const SkeletonGrid = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <ProductSkeleton key={i} />
    ))}
  </div>
);

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug;

  const isAllCategories = slug === 'all';
  const [categoryData, setCategoryData] = useState(null);
  const [isValidCategory, setIsValidCategory] = useState(true);
  const [categoryName, setCategoryName] = useState(isAllCategories ? 'All Categories' : slug);

  useEffect(() => {
    async function loadContext() {
      const context = await getIndustryContext(slug);
      if (!context) {
        setIsValidCategory(false);
        return;
      }
      setCategoryData(context.data);
      setCategoryName(context.title || (context.type === 'all' ? 'All Categories' : slug));
    }
    loadContext();
  }, [slug]);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  const abortControllerRef = useRef(null);
  const requestIdRef = useRef(0);

  const fetchProducts = useCallback(async ({
    search = '',
    pageNum = 0,
    append = false
  } = {}) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    const currentRequestId = ++requestIdRef.current;

    try {
      setIsSearching(!!search);

      const { products: fetchedProducts, total, hasMore: moreAvailable } = await fetchProductsFromService({
        feedType: 'new-arrivals',
        searchTerm: search,
        category: slug,
        page: pageNum,
        pageSize: PAGE_SIZE,
        signal: abortControllerRef.current.signal
      });

      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      setProducts((prev) => {
        const merged = append
          ? [...prev, ...fetchedProducts]
          : fetchedProducts;

        return merged.slice(-MAX_RESULTS);
      });

      setHasMore(moreAvailable);
      setError(null);

    } catch (err) {
      if (err.name === 'AbortError') return;

      console.error('[CategoryPage Error]', {
        component: 'CategoryPage',
        category: slug,
        search,
        page: pageNum,
        error: err?.message,
      });

      setError(err?.message || 'Failed to load products');

    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
        setIsSearching(false);
      }
    }

  }, [slug]);

  useEffect(() => {
    if (!slug || !isValidCategory) return;

    setPage(0);

    fetchProducts({
      search: '',
      pageNum: 0,
      append: false,
    });

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [
    slug,
    isValidCategory,
    fetchProducts
  ]);

  useEffect(() => {
    if (!slug || !isValidCategory) return;

    if (searchTerm === '') {
      setPage(0);

      fetchProducts({
        search: '',
        pageNum: 0,
        append: false,
      });

      return;
    }

    const timer = setTimeout(() => {
      setPage(0);

      fetchProducts({
        search: searchTerm,
        pageNum: 0,
        append: false,
      });
    }, 300);

    return () => clearTimeout(timer);

  }, [
    searchTerm,
    fetchProducts,
    slug,
    isValidCategory
  ]);

  const loadMore = () => {
    const nextPage = page + 1;

    setPage(nextPage);

    fetchProducts({
      search: searchTerm,
      pageNum: nextPage,
      append: true,
    });
  };

  const getVerificationBadge = (status) => {
    if (!status || status === 'none') {
      return null;
    }

    const style =
      VERIFICATION_STYLES[status] ||
      'bg-gray-100 text-gray-600';

    const label =
      status === 'verified'
        ? '✅ Verified'
        : status === 'pending'
          ? '⏳ Pending'
          : '❌ Rejected';

    return (
      <span className={`${style} text-xs px-2 py-0.5 rounded-full`}>
        {label}
      </span>
    );
  };

  const WhatsAppButton = ({ number }) => {
    const hasWhatsapp = !!number;

    return (
      <Link
        href={hasWhatsapp ? formatWhatsAppLink(number) : '#'}
        target={hasWhatsapp ? '_blank' : undefined}
        rel={hasWhatsapp ? 'noopener noreferrer' : undefined}
        className={`mt-4 inline-flex items-center justify-center gap-2 text-sm font-medium py-2 px-4 rounded-full transition w-full ${hasWhatsapp
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        aria-disabled={!hasWhatsapp}
        onClick={(e) => {
          if (!hasWhatsapp) e.preventDefault();
        }}
      >
        <svg
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.588 2.014.896 3.149.896h.002c3.18 0 5.767-2.586 5.768-5.766.001-3.18-2.585-5.767-5.766-5.768z" />
        </svg>

        {hasWhatsapp
          ? 'Contact Supplier'
          : 'No Contact'}
      </Link>
    );
  };

  if (!slug || !isValidCategory) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Invalid Category
          </h1>

          <p className="text-gray-500 mb-4">
            The category you're looking for doesn't exist.
          </p>

          <Link
            href="/marketplace"
            className="text-orange-600 underline font-medium"
          >
            Browse Marketplace
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-24">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link
            href="/marketplace"
            className="hover:text-orange-600 transition"
          >
            Marketplace
          </Link>

          <span>/</span>

          <span className="text-gray-900 font-medium">
            {categoryName}
          </span>
        </div>

        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl mb-8">

          <div
            className={`absolute inset-0 bg-gradient-to-br ${categoryData?.color ||
              'from-orange-500 to-red-500'
              }`}
          />

          <div className="absolute inset-0 bg-black/30" />

          <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row md:items-center gap-6">

            {categoryData?.image && (
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0">
                <Image
                  src={categoryData.image}
                  alt={categoryName}
                  width={96}
                  height={96}
                  className="object-cover"
                  priority
                />
              </div>
            )}

            <div className="flex-1">

              <h1 className="text-3xl md:text-5xl font-bold text-white">
                {categoryName}
              </h1>

              {categoryData?.description && (
                <p className="mt-3 text-white/90 max-w-2xl text-base md:text-lg">
                  {categoryData.description}
                </p>
              )}

              <div className="flex flex-wrap gap-3 mt-5">

                {categoryData?.growth && (
                  <span className="px-3 py-1 rounded-full bg-white/20 text-white text-sm backdrop-blur-md">
                    📈 {categoryData.growth} growth
                  </span>
                )}

                {categoryData?.count && (
                  <span className="px-3 py-1 rounded-full bg-white/20 text-white text-sm backdrop-blur-md">
                    🏭 {categoryData.count.toLocaleString()} suppliers
                  </span>
                )}

                <span className="px-3 py-1 rounded-full bg-white/20 text-white text-sm backdrop-blur-md">
                  📦 {products.length} live listings
                </span>

              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <input
            type="text"
            placeholder={`🔍 Search ${isAllCategories
                ? 'all products'
                : `in ${categoryName}`
              }...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 pr-10 bg-white"
          />

          {isSearching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Subcategories */}
        {categoryData?.subcategories?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {categoryData.subcategories.map((sub) => (
              <button
                key={sub.slug}
                className="px-4 py-2 rounded-full bg-white border border-gray-200 hover:border-orange-400 hover:bg-orange-50 text-sm font-medium transition"
              >
                {sub.title}

                {sub.count && (
                  <span className="ml-2 text-gray-400">
                    ({sub.count})
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mb-6 flex gap-3 flex-wrap">

          <Link
            href="/add-product"
            className="px-6 py-2 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition font-medium"
          >
            List a Product
          </Link>

          <Link
            href="/add-request"
            className="px-6 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition font-medium"
          >
            Post Buyer Request
          </Link>

        </div>

        {loading && products.length === 0 ? (

          <SkeletonGrid count={8} />

        ) : error ? (

          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="text-red-500 text-center">

              <p className="text-lg font-medium">
                Failed to load products
              </p>

              <p className="text-sm text-gray-500 mt-1">
                {error}
              </p>

              <button
                onClick={() =>
                  fetchProducts({
                    search: searchTerm,
                    pageNum: 0,
                  })
                }
                className="mt-4 bg-orange-600 text-white px-6 py-2 rounded-full hover:bg-orange-700 transition"
              >
                Try Again
              </button>

            </div>
          </div>

        ) : products.length === 0 ? (

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">

            <div className="text-6xl mb-4">
              📭
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm
                ? `No results for "${searchTerm}"`
                : `No suppliers found in ${categoryName}`}
            </h3>

            <p className="text-gray-500 mb-2">
              {searchTerm
                ? 'Try another search keyword.'
                : `This category is still growing. Be the first supplier in ${categoryName}.`}
            </p>

            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-5 px-6 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition"
              >
                Clear Search
              </button>
            )}

          </div>

        ) : (

          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-lg transition duration-200 overflow-hidden flex flex-col"
                >

                  <Link
                    href={`/products/${product.id}`}
                    className="block relative"
                  >

                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        width={400}
                        height={160}
                        className="w-full h-40 object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400">
                        📷 No image
                      </div>
                    )}

                  </Link>

                  <div className="p-5 flex flex-col flex-grow">

                    <div className="flex items-start justify-between gap-2">

                      <Link
                        href={`/products/${product.id}`}
                        className="hover:underline min-w-0"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {product.name}
                        </h3>
                      </Link>

                      {getVerificationBadge(product.verification_status)}

                    </div>

                    {product.company_name && (
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        🏢 {product.company_name}
                      </p>
                    )}

                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-3 text-xs">

                      <span className="bg-gray-100 px-2 py-1 rounded-full">
                        {product.category ||
                          categoryData?.title ||
                          categoryName}
                      </span>

                      <span
                        className={`px-2 py-1 rounded-full ${getLocationColor(product.location)}`}
                      >
                        📍 {product.location || 'Unknown'}
                      </span>

                    </div>

                    <div className="mt-4">
                      <span className="text-2xl font-bold text-orange-600">
                        ₹{formatPrice(product.price)}
                      </span>
                    </div>

                    {product.created_at && (
                      <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                        <span>🆕</span>

                        {getRelativeTime(product.created_at)}
                      </div>
                    )}

                    <WhatsAppButton number={product.whatsapp} />

                  </div>
                </div>
              ))}

            </div>

            {hasMore && (
              <div className="mt-8 text-center">

                <button
                  onClick={loadMore}
                  disabled={isSearching}
                  className="px-8 py-3 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition disabled:opacity-50 font-medium"
                >
                  {isSearching
                    ? 'Loading...'
                    : 'Load More Products'}
                </button>

              </div>
            )}

          </>
        )}

      </div>
    </main>
  );
}