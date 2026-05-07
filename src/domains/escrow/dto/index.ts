import { EntityId, PaginationParams } from '../../../shared/types';
import { EscrowStatus, MilestoneStatus, ReleaseConditionType, EscrowFee } from '../types';

export interface CreateEscrowRequest {
  orderId: EntityId;
  buyerId: EntityId;
  sellerId: EntityId;
  totalAmount: number;
  currency: string;
  fees: EscrowFee[];
  milestones: {
    title: string;
    description?: string;
    amount: number;
    releaseCondition: ReleaseConditionType;
    releaseDate?: Date;
  }[];
  termsAndConditions: string;
}

export interface UpdateEscrowStatusRequest {
  status: EscrowStatus;
  reason?: string;
}

export interface ReleaseMilestoneRequest {
  milestoneId: EntityId;
  reason?: string;
}

export interface EscrowFilters extends PaginationParams {
  status?: EscrowStatus;
  buyerId?: EntityId;
  sellerId?: EntityId;
  orderId?: EntityId;
}
