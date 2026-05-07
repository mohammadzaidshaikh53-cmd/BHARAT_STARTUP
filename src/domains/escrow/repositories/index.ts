import { EntityId } from '../../../shared/types';
import { Escrow, EscrowMilestone } from '../types';
import { EscrowFilters } from '../dto';

export interface IEscrowRepository {
  findById(id: EntityId): Promise<Escrow | null>;
  findByOrderId(orderId: EntityId): Promise<Escrow | null>;
  findMany(filters: EscrowFilters): Promise<{ data: Escrow[]; total: number }>;
  save(escrow: Escrow): Promise<Escrow>;
  updateStatus(id: EntityId, status: string): Promise<void>;
  
  findMilestoneById(milestoneId: EntityId): Promise<EscrowMilestone | null>;
  updateMilestone(milestone: EscrowMilestone): Promise<EscrowMilestone>;
}
