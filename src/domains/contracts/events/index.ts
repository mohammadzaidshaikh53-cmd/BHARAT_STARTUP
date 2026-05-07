import { EntityId, OrganizationScoped } from '../../../shared/types';
import { ContractStatus, ContractAmendment, DigitalSignature } from '../types';

export interface ContractBaseEvent {
  contractId: EntityId;
  organizationId: EntityId;
  timestamp: Date;
  actorId?: EntityId;
}

export interface ContractCreatedEvent extends ContractBaseEvent {
  title: string;
  creatorId: EntityId;
}

export interface ContractStatusUpdatedEvent extends ContractBaseEvent {
  oldStatus: ContractStatus;
  newStatus: ContractStatus;
  reason?: string;
}

export interface ContractSignedEvent extends ContractBaseEvent {
  partyId: EntityId;
  signature: DigitalSignature;
}

export interface ContractAmendedEvent extends ContractBaseEvent {
  amendmentId: EntityId;
  amendment: ContractAmendment;
}

export interface ContractTerminatedEvent extends ContractBaseEvent {
  reason: string;
}

export interface ContractExpiredEvent extends ContractBaseEvent {}

export interface ContractRenewedEvent extends ContractBaseEvent {
  newContractId: EntityId;
}

export enum ContractEventName {
  CREATED = 'contract.created',
  STATUS_UPDATED = 'contract.status_updated',
  SIGNED = 'contract.signed',
  AMENDED = 'contract.amended',
  TERMINATED = 'contract.terminated',
  EXPIRED = 'contract.expired',
  RENEWED = 'contract.renewed',
}

export interface IContractEventPublisher {
  publish(eventName: ContractEventName, event: ContractBaseEvent): Promise<void>;
}
