import { BaseEntity, EntityId, OrganizationScoped } from '../../../shared/types';

export enum EscrowStatus {
  PENDING = 'PENDING',
  FUNDED = 'FUNDED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED',
  REFUNDED = 'REFUNDED'
}

export enum ReleaseConditionType {
  MANUAL = 'MANUAL',
  TIME_BOUND = 'TIME_BOUND',
  CONDITION_BOUND = 'CONDITION_BOUND'
}

export enum MilestoneStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  RELEASED = 'RELEASED',
  CANCELLED = 'CANCELLED'
}

export interface EscrowMilestone extends BaseEntity {
  escrowId: EntityId;
  title: string;
  description?: string;
  amount: number;
  status: MilestoneStatus;
  releaseCondition: ReleaseConditionType;
  releaseDate?: Date;
  metadata?: Record<string, any>;
}

export interface EscrowFee {
  type: 'PERCENTAGE' | 'FLAT';
  value: number;
  description: string;
}

export interface Escrow extends BaseEntity, OrganizationScoped {
  orderId: EntityId;
  buyerId: EntityId;
  sellerId: EntityId;
  totalAmount: number;
  currency: string;
  status: EscrowStatus;
  fees: EscrowFee[];
  milestones: EscrowMilestone[];
  termsAndConditions: string;
  metadata?: Record<string, any>;
}
