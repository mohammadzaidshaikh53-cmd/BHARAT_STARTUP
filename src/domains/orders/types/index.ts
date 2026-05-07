import { BaseEntity, EntityId, OrganizationScoped } from '../../../shared/types';

export enum OrderStatus {
  PENDING = 'PENDING',
  AWAITING_PAYMENT = 'AWAITING_PAYMENT',
  PAID = 'PAID',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export interface OrderItem {
  productId: EntityId;
  variantId?: EntityId;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxAmount: number;
  discountAmount: number;
  metadata?: Record<string, any>;
}

export interface ShippingAddress {
  recipientName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
}

export interface Order extends BaseEntity, OrganizationScoped {
  buyerId: EntityId;
  sellerId: EntityId;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  taxTotal: number;
  shippingTotal: number;
  discountTotal: number;
  shippingAddress: ShippingAddress;
  billingAddress: ShippingAddress;
  paymentId?: EntityId;
  escrowId?: EntityId;
  logisticsId?: EntityId;
  contractId?: EntityId;
  notes?: string;
  metadata?: Record<string, any>;
}
