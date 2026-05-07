import { EntityId, ApiResponse } from '../../../shared/types';
import { Escrow } from '../types';
import { CreateEscrowRequest, UpdateEscrowStatusRequest, ReleaseMilestoneRequest, EscrowFilters } from '../dto';

export interface IEscrowService {
  createEscrow(request: CreateEscrowRequest): Promise<ApiResponse<Escrow>>;
  getEscrow(id: EntityId): Promise<ApiResponse<Escrow>>;
  fundEscrow(id: EntityId): Promise<ApiResponse<void>>;
  releaseMilestone(id: EntityId, request: ReleaseMilestoneRequest): Promise<ApiResponse<void>>;
  cancelEscrow(id: EntityId, reason: string): Promise<ApiResponse<void>>;
  disputeEscrow(id: EntityId, reason: string): Promise<ApiResponse<void>>;
  listEscrows(filters: EscrowFilters): Promise<ApiResponse<{ data: Escrow[]; total: number }>>;
}
