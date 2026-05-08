/**
 * Enterprise Marketplace Components
 * Pattern from: Alibaba, IndiaMART, Faire, Amazon Business
 *
 * Features:
 * - Advanced product cards
 * - Supplier profiles
 * - Bulk pricing tables
 * - RFQ workflows
 * - Trust indicators
 */

'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import {
  Heart,
  Share2,
  Eye,
  Star,
  Shield,
  Truck,
  CheckCircle,
  MessageSquare,
  ChevronDown,
  Filter,
  Grid3x3,
  LayoutList,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { PhysicsCard, ScrollReveal } from '@/components/motion';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const springTransition = {
  type: 'spring',
  stiffness: 350,
  damping: 28,
};

/**
 * Product Card - Enterprise B2B style
 */
export function ProductCard({
  product,
  onSave,
  onQuickInquiry,
  className = '',
}) {
  const [isHovered, setIsHovered] = useState(false);
  const {
    id,
    name,
    price,
    moq,
    images,
    supplier,
    rating,
    reviews,
    verified,
    fastDelivery,
    trustScore,
  } = product;

  return (
    <PhysicsCard
      className={`card-premium overflow-hidden group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={images?.[0] || 'https://via.placeholder.com/400'}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Overlay actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2"
        >
          <button
            onClick={() => onSave?.(id)}
            className="p-2.5 rounded-full bg-white text-foreground hover:bg-gray-100 transition-colors"
          >
            <Heart className="w-5 h-5" />
          </button>
          <button
            onClick={() => {}}
            className="p-2.5 rounded-full bg-white text-foreground hover:bg-gray-100 transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </motion.div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {verified && (
            <span className="px-2 py-1 bg-emerald-500 text-white text-xs font-medium rounded-lg flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Verified
            </span>
          )}
          {fastDelivery && (
            <span className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-lg flex items-center gap-1">
              <Truck className="w-3 h-3" />
              Fast
            </span>
          )}
        </div>

        {/* MOQ Badge */}
        <div className="absolute bottom-3 right-3">
          <span className="px-2 py-1 bg-white/90 dark:bg-gray-900/90 text-xs font-medium rounded-lg">
            MOQ: {moq}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Supplier */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-muted-foreground">{supplier?.name || 'Supplier'}</span>
          {supplier?.verified && (
            <CheckCircle className="w-3 h-3 text-emerald-500" />
          )}
        </div>

        {/* Product Name */}
        <Link href={`/products/${id}`}>
          <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-lg font-bold text-primary">{price}</span>
          <span className="text-xs text-muted-foreground">/ unit</span>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400 fill-current" />
            <span>{rating}</span>
            <span>({reviews})</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{product.views || 0}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1"
            onClick={() => onQuickInquiry?.(id)}
          >
            <MessageSquare className="w-4 h-4" />
            Inquiry
          </Button>
          <Button size="sm" className="flex-1">
            Get Quote
          </Button>
        </div>
      </div>
    </PhysicsCard>
  );
}

/**
 * Product Grid with Filters
 */
export function ProductGrid({
  products = [],
  loading = false,
  viewMode = 'grid', // 'grid' | 'list'
  onSave,
  onQuickInquiry,
  className = '',
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="card-premium overflow-hidden animate-pulse">
            <div className="aspect-square bg-gray-200 dark:bg-gray-700" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="mt-4 font-semibold">No products found</h3>
        <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-6 ${viewMode === 'grid'
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      : 'grid-cols-1'
    }`}>
      {products.map((product, index) => (
        <ScrollReveal key={product.id} delay={index * 0.05}>
          {viewMode === 'grid' ? (
            <ProductCard
              product={product}
              onSave={onSave}
              onQuickInquiry={onQuickInquiry}
            />
          ) : (
            <ProductListItem
              product={product}
              onSave={onSave}
              onQuickInquiry={onQuickInquiry}
            />
          )}
        </ScrollReveal>
      ))}
    </div>
  );
}

/**
 * Product List Item - compact view
 */
export function ProductListItem({
  product,
  onSave,
  onQuickInquiry,
}) {
  const {
    id,
    name,
    price,
    moq,
    images,
    supplier,
    rating,
    description,
  } = product;

  return (
    <PhysicsCard className="card-premium p-4 flex gap-4">
      <img
        src={images?.[0] || 'https://via.placeholder.com/150'}
        alt={name}
        className="w-32 h-32 rounded-xl object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">{supplier?.name}</p>
            <Link href={`/products/${id}`}>
              <h3 className="font-semibold hover:text-primary transition-colors">{name}</h3>
            </Link>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-primary">{price}</p>
            <p className="text-xs text-muted-foreground">MOQ: {moq}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center gap-1 text-sm">
            <Star className="w-4 h-4 text-amber-400 fill-current" />
            <span>{rating}</span>
          </div>
          <Button variant="outline" size="sm" className="gap-1">
            <Heart className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => onQuickInquiry?.(id)}
          >
            <MessageSquare className="w-4 h-4" />
            Inquiry
          </Button>
          <Button size="sm">Get Quote</Button>
        </div>
      </div>
    </PhysicsCard>
  );
}

/**
 * Supplier Card
 */
export function SupplierCard({
  supplier,
  className = '',
}) {
  const {
    id,
    name,
    logo,
    location,
    rating,
    verified,
    trustScore,
    productCount,
    responseRate,
    responseTime,
  } = supplier;

  return (
    <PhysicsCard className={`card-premium p-5 ${className}`}>
      <div className="flex items-start gap-4">
        <img
          src={logo || 'https://via.placeholder.com/80'}
          alt={name}
          className="w-16 h-16 rounded-xl object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">{name}</h3>
            {verified && (
              <span className="shrink-0 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                <Shield className="w-3 h-3 text-white" />
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{location}</p>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-3 text-xs">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400 fill-current" />
              <span>{rating}</span>
            </div>
            <div className="text-muted-foreground">
              <span>{productCount}</span> products
            </div>
            <div className="text-emerald-500">
              {responseRate}% response
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
        <Button variant="outline" size="sm" className="flex-1">
          View Profile
        </Button>
        <Button size="sm" className="flex-1">
          Contact
        </Button>
      </div>
    </PhysicsCard>
  );
}

/**
 * Bulk Pricing Table
 */
export function BulkPricingTable({
  pricingTiers = [],
  basePrice,
  className = '',
}) {
  return (
    <div className={`card-premium overflow-hidden ${className}`}>
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <h3 className="font-semibold">Bulk Pricing</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Save more with larger orders
        </p>
      </div>

      <table className="w-full">
        <thead className="bg-muted/30">
          <tr>
            <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
              Quantity
            </th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
              Price per Unit
            </th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
              Savings
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
          {pricingTiers.map((tier, i) => {
            const savings = ((basePrice - tier.price) / basePrice * 100).toFixed(0);
            return (
              <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-5 py-3 text-sm">
                  {tier.minQuantity}+ {tier.maxQuantity && `- ${tier.maxQuantity}`}
                </td>
                <td className="px-5 py-3 text-sm font-semibold">
                  {tier.price}
                </td>
                <td className="px-5 py-3">
                  {savings > 0 ? (
                    <span className="text-sm text-emerald-500">Save {savings}%</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Filter Panel
 */
export function FilterPanel({
  filters = {},
  onChange,
  categories = [],
  className = '',
}) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onChange?.(newFilters);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Categories */}
      <div>
        <h4 className="font-semibold text-sm mb-3">Categories</h4>
        <div className="space-y-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleChange('category', cat.id)}
              className={`
                w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm
                transition-colors
                ${localFilters.category === cat.id
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              `}
            >
              <span>{cat.name}</span>
              <span className="text-xs text-muted-foreground">{cat.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-semibold text-sm mb-3">Price Range</h4>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={localFilters.minPrice || ''}
            onChange={(e) => handleChange('minPrice', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm"
          />
          <span className="self-center text-muted-foreground">-</span>
          <input
            type="number"
            placeholder="Max"
            value={localFilters.maxPrice || ''}
            onChange={(e) => handleChange('maxPrice', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm"
          />
        </div>
      </div>

      {/* Verified Only */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={localFilters.verifiedOnly || false}
            onChange={(e) => handleChange('verifiedOnly', e.target.checked)}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm">Verified suppliers only</span>
        </label>
      </div>
    </div>
  );
}
