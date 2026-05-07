import { BaseEntity, EntityId, OrganizationScoped } from '../../../shared/types';

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  AUTHORIZED = 'AUTHORIZED',
  CAPTURED = 'CAPTURED',
  FAILED = 'FAILED',
  VOIDED = 'VOIDED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
  RECONCILED = 'RECONCILED'
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  WALLET = 'WALLET',
  CRYPTO = 'CRYPTO',
  ESCROW = 'ESCROW'
}

export interface Transaction extends BaseEntity, OrganizationScoped {
  orderId: EntityId;
  payerId: EntityId;
  payeeId: EntityId;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  provider: string; // e.g., 'stripe', 'razorpay'
  providerReference: string;
  reconciliationId?: string;
  metadata?: Record<string, any>;
}

export interface Refund extends BaseEntity {
  paymentId: EntityId;
  amount: number;
  reason: string;
  status: PaymentStatus;
  providerReference?: string;
}
