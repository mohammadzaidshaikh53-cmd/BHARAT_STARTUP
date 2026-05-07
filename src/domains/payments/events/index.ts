import { EntityId } from '../../../shared/types';
import { PaymentStatus, PaymentMethod } from '../types';

export enum PaymentEvent {
  INITIATED = 'payment.initiated',
  AUTHORIZED = 'payment.authorized',
  CAPTURED = 'payment.captured',
  FAILED = 'payment.failed',
  REFUNDED = 'payment.refunded',
  RECONCILED = 'payment.reconciled'
}

export interface PaymentBaseEvent {
  transactionId: EntityId;
  orderId: EntityId;
  timestamp: Date;
}

export interface PaymentCapturedEvent extends PaymentBaseEvent {
  amount: number;
  currency: string;
  method: PaymentMethod;
}

export interface PaymentFailedEvent extends PaymentBaseEvent {
  errorCode: string;
  errorMessage: string;
}
