import { EntityId, ApiResponse } from '../../../shared/types';
import { Contract } from '../types';
import { CreateContractRequest, SignContractRequest, AmendContractRequest, ContractFilters } from '../dto';

export interface IContractService {
  createContract(request: CreateContractRequest): Promise<ApiResponse<Contract>>;
  getContract(id: EntityId): Promise<ApiResponse<Contract>>;
  signContract(id: EntityId, partyId: EntityId, request: SignContractRequest): Promise<ApiResponse<void>>;
  amendContract(id: EntityId, request: AmendContractRequest): Promise<ApiResponse<Contract>>;
  terminateContract(id: EntityId, reason: string): Promise<ApiResponse<void>>;
  listContracts(filters: ContractFilters): Promise<ApiResponse<{ data: Contract[]; total: number }>>;
}
