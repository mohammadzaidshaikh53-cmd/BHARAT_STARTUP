import { EntityId } from '../../../shared/types';
import { Contract, ContractAmendment } from '../types';
import { ContractFilters } from '../dto';

export interface IContractRepository {
  findById(id: EntityId): Promise<Contract | null>;
  findMany(filters: ContractFilters): Promise<{ data: Contract[]; total: number }>;
  save(contract: Contract): Promise<Contract>;
  
  findAmendmentsByContractId(contractId: EntityId): Promise<ContractAmendment[]>;
  saveAmendment(amendment: ContractAmendment): Promise<ContractAmendment>;
}
