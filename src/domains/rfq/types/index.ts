/**
 * Project One Solution: RFQ Domain Foundations
 */

import { EntityId, OrganizationScoped } from '../../shared/types';

export enum RFQStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
  AWARDED = 'AWARDED',
}

export enum QuoteStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  REJECTED = 'REJECTED',
  ACCEPTED = 'ACCEPTED',
  EXPIRED = 'EXPIRED',
}

export interface RFQItem {
  id: EntityId;
  productId?: EntityId;
  description: string;
  quantity: number;
  unit: string;
  targetPrice?: number;
}

export interface RFQ extends OrganizationScoped {
  id: EntityId;
  title: string;
  description: string;
  items: RFQItem[];
  status: RFQStatus;
  expiryDate: Date;
  isPrivate: boolean;
  invitedSuppliers?: EntityId[];
}

export interface Quote extends OrganizationScoped {
  id: EntityId;
  rfqId: EntityId;
  status: QuoteStatus;
  items: Array<{
    rfqItemId: EntityId;
    unitPrice: number;
    totalPrice: number;
    deliveryDate: Date;
    notes?: string;
  }>;
  validUntil: Date;
  totalAmount: number;
  currency: string;
}
