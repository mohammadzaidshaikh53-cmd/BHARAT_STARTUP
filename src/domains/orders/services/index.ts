import { EntityId } from '../../../shared/types';
import { CreateOrderRequest, UpdateOrderRequest, OrderQueryFilters } from '../dto';
import { Order } from '../types';

export interface IOrderService {
  createOrder(request: CreateOrderRequest): Promise<Order>;
  getOrder(id: EntityId): Promise<Order>;
  listOrders(filters: OrderQueryFilters): Promise<{ orders: Order[]; total: number }>;
  updateOrder(id: EntityId, request: UpdateOrderRequest): Promise<Order>;
  cancelOrder(id: EntityId, reason: string): Promise<void>;
  calculateTotals(order: Partial<Order>): Promise<Partial<Order>>;
}
