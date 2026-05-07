import { EntityId } from '../../../shared/types';
import { Transaction, PaymentStatus } from '../types';
import { PaymentQueryFilters } from '../dto';

export interface IPaymentRepository {
  findById(id: EntityId): Promise<Transaction | null>;
  findByOrderId(orderId: EntityId): Promise<Transaction[]>;
  findByReference(providerReference: string): Promise<Transaction | null>;
  findAll(filters: PaymentQueryFilters): Promise<Transaction[]>;
  save(transaction: Transaction): Promise<Transaction>;
  updateStatus(id: EntityId, status: PaymentStatus): Promise<void>;
}
