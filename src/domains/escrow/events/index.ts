import { EntityId } from '../../../shared/types';
import { EscrowStatus, MilestoneStatus } from '../types';

export interface EscrowCreatedEvent {
  escrowId: EntityId;
  orderId: EntityId;
  buyerId: EntityId;
  sellerId: EntityId;
  amount: number;
  timestamp: Date;
}

export interface EscrowFundedEvent {
  escrowId: EntityId;
  amount: number;
  timestamp: Date;
}

export interface MilestoneReleasedEvent {
  escrowId: EntityId;
  milestoneId: EntityId;
  amount: number;
  timestamp: Date;
}

export interface EscrowStatusChangedEvent {
  escrowId: EntityId;
  oldStatus: EscrowStatus;
  newStatus: EscrowStatus;
  reason?: string;
  timestamp: Date;
}
