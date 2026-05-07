import { EntityId } from '../../../shared/types';
import { OrderStatus } from '../types';

export enum OrderEvent {
  CREATED = 'order.created',
  STATUS_UPDATED = 'order.status_updated',
  PAYMENT_RECEIVED = 'order.payment_received',
  SHIPPED = 'order.shipped',
  DELIVERED = 'order.delivered',
  COMPLETED = 'order.completed',
  CANCELLED = 'order.cancelled',
  REFUNDED = 'order.refunded'
}

export interface OrderBaseEvent {
  orderId: EntityId;
  timestamp: Date;
  actorId?: EntityId;
}

export interface OrderStatusUpdatedEvent extends OrderBaseEvent {
  oldStatus: OrderStatus;
  newStatus: OrderStatus;
}

export interface OrderCreatedEvent extends OrderBaseEvent {
  buyerId: EntityId;
  sellerId: EntityId;
  totalAmount: number;
  currency: string;
}
