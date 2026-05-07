import { EntityId, PaginationParams } from '../../../shared/types';
import { Order, OrderStatus, ShippingAddress, OrderItem } from '../types';

export interface CreateOrderRequest {
  sellerId: EntityId;
  items: Array<Omit<OrderItem, 'totalPrice' | 'taxAmount' | 'discountAmount'>>;
  shippingAddress: ShippingAddress;
  billingAddress: ShippingAddress;
  currency: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface UpdateOrderRequest {
  status?: OrderStatus;
  shippingAddress?: Partial<ShippingAddress>;
  billingAddress?: Partial<ShippingAddress>;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface OrderQueryFilters extends PaginationParams {
  buyerId?: EntityId;
  sellerId?: EntityId;
  status?: OrderStatus;
  startDate?: Date;
  endDate?: Date;
}

export interface OrderResponse {
  order: Order;
}

export interface OrderListResponse {
  orders: Order[];
  total: number;
}
