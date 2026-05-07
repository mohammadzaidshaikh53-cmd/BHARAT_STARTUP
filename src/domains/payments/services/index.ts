import { EntityId } from '../../../shared/types';
import { InitiatePaymentRequest, ProcessRefundRequest, PaymentQueryFilters } from '../dto';
import { Transaction } from '../types';

export interface IPaymentService {
  initiatePayment(request: InitiatePaymentRequest): Promise<Transaction>;
  capturePayment(transactionId: EntityId): Promise<Transaction>;
  refundPayment(request: ProcessRefundRequest): Promise<void>;
  getTransaction(id: EntityId): Promise<Transaction>;
  verifyWebhook(payload: any, signature: string): Promise<boolean>;
  handleWebhook(payload: any): Promise<void>;
  reconcileTransactions(startDate: Date, endDate: Date): Promise<void>;
}
