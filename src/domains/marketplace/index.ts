import { BaseEntity, EntityId, OrganizationScoped } from '../../../shared/types';

export enum ProductStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  REJECTED = 'REJECTED',
  ARCHIVED = 'ARCHIVED',
}

export enum ProductVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE', // Only visible to invited organizations/users
  UNLISTED = 'UNLISTED', // Accessible by direct link only
}

export interface ProductCategory {
  id: EntityId;
  name: string;
  slug: string;
  description?: string;
  parentCategoryId?: EntityId;
}

export interface ProductVariant {
  id: EntityId;
  productId: EntityId;
  sku: string;
  name: string; // e.g., "Color: Red, Size: M"
  price: number;
  stockQuantity: number;
  attributes: Record<string, string>; // { color: 'Red', size: 'M' }
  imageUrl?: string;
  metadata?: Record<string, any>;
}

export interface ProductPrice {
  amount: number;
  currency: string;
  discountAmount?: number;
  validUntil?: Date;
}

export interface ProductRating {
  userId: EntityId;
  rating: number; // 1-5 stars
  comment?: string;
  timestamp: Date;
}

export interface Product extends BaseEntity, OrganizationScoped {
  name: string;
  slug: string;
  description: string;
  sellerId: EntityId; // Organization ID of the seller
  status: ProductStatus;
  visibility: ProductVisibility;
  categoryIds: EntityId[];
  mainImageUrl: string;
  additionalImageUrls?: string[];
  price: ProductPrice;
  variants?: ProductVariant[];
  stockQuantity: number; // Sum of all variants or simple stock for non-variant products
  averageRating: number;
  totalRatings: number;
  metadata?: Record<string, any>;
  keywords?: string[];
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
}

export interface RequestForProduct extends BaseEntity, OrganizationScoped {
  productId: EntityId;
  buyerId: EntityId;
  quantity: number;
  notes?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'FULFILLED';
  requestedAt: Date;
}
