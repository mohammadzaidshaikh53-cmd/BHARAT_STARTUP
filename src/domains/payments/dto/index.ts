import { EntityId, PaginationParams } from '../../../shared/types';
import { Transaction, PaymentStatus, PaymentMethod } from '../types';

export interface InitiatePaymentRequest {
  orderId: EntityId;
  amount: number;
  currency: string;
  method: PaymentMethod;
  metadata?: Record<string, any>;
}

export interface ProcessRefundRequest {
  paymentId: EntityId;
  amount: number;
  reason: string;
}

export interface PaymentQueryFilters extends PaginationParams {
  payerId?: EntityId;
  payeeId?: EntityId;
  orderId?: EntityId;
  status?: PaymentStatus;
}

export interface TransactionResponse {
  transaction: Transaction;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  transactionId: EntityId;
}
