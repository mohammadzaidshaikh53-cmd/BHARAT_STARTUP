import { BaseEntity, EntityId, OrganizationScoped } from '../../../shared/types';

export enum ContractStatus {
  DRAFT = 'DRAFT',
  PENDING_SIGNATURE = 'PENDING_SIGNATURE',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  TERMINATED = 'TERMINATED',
  AMENDED = 'AMENDED'
}

export interface ContractParty {
  partyId: EntityId;
  role: 'BUYER' | 'SELLER' | 'SERVICE_PROVIDER' | 'OTHER';
  legalName: string;
  representativeName: string;
}

export interface DigitalSignature {
  partyId: EntityId;
  signatureData: string;
  signedAt: Date;
  ipAddress: string;
  metadata?: Record<string, any>;
}

export interface ContractTerm {
  id: string;
  title: string;
  content: string;
  isMandatory: boolean;
}

export interface ContractAmendment extends BaseEntity {
  contractId: EntityId;
  reason: string;
  changes: string;
  amendedBy: EntityId;
}

export interface Contract extends BaseEntity, OrganizationScoped {
  title: string;
  description?: string;
  status: ContractStatus;
  parties: ContractParty[];
  terms: ContractTerm[];
  signatures: DigitalSignature[];
  validFrom: Date;
  validUntil?: Date;
  parentContractId?: EntityId; // For amendments/renewals
  documentUrl?: string; // Reference to stored PDF/Doc
  metadata?: Record<string, any>;
}
