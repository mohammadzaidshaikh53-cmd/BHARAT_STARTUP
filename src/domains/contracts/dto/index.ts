import { EntityId, PaginationParams } from '../../../shared/types';
import { ContractStatus, ContractParty, ContractTerm } from '../types';

export interface CreateContractRequest {
  title: string;
  description?: string;
  parties: ContractParty[];
  terms: ContractTerm[];
  validFrom: Date;
  validUntil?: Date;
  organizationId: EntityId;
}

export interface SignContractRequest {
  signatureData: string;
  ipAddress: string;
  metadata?: Record<string, any>;
}

export interface AmendContractRequest {
  reason: string;
  changes: string;
  newTerms?: ContractTerm[];
  newValidityUntil?: Date;
}

export interface ContractFilters extends PaginationParams {
  status?: ContractStatus;
  partyId?: EntityId;
  organizationId?: EntityId;
}
