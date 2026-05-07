import { EntityId } from '../../../shared/types';
import { Order, OrderStatus } from '../types';
import { OrderQueryFilters } from '../dto';

export interface IOrderRepository {
  findById(id: EntityId): Promise<Order | null>;
  findAll(filters: OrderQueryFilters): Promise<Order[]>;
  count(filters: OrderQueryFilters): Promise<number>;
  save(order: Order): Promise<Order>;
  updateStatus(id: EntityId, status: OrderStatus): Promise<void>;
  findByPaymentId(paymentId: EntityId): Promise<Order | null>;
}
