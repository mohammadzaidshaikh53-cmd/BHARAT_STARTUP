import { IContractSchemaValidator, ContractSchemas } from '../schemas';
import { CreateContractRequest, SignContractRequest, AmendContractRequest, ContractFilters } from '../dto';
import { ContractStatus } from '../types';
import { Validators } from '../../../shared/validators'; // Assuming shared validators exist

export interface IContractValidator {
  validateCreateContract(request: CreateContractRequest): { isValid: boolean; errors: string[] };
  validateSignContract(request: SignContractRequest): { isValid: boolean; errors: string[] };
  validateAmendContract(request: AmendContractRequest): { isValid: boolean; errors: string[] };
  validateContractFilters(filters: ContractFilters): { isValid: boolean; errors: string[] };
  validateContractStatusTransition(currentStatus: ContractStatus, newStatus: ContractStatus): { isValid: boolean; errors: string[] };
}

// A simple implementation using shared validators. In a real scenario, this would use a robust validation library like Zod.
export class ContractValidators implements IContractValidator {
  validateCreateContract(request: CreateContractRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.title || request.title.length < ContractSchemas.createContract.title.split('_')[2] || request.title.length > ContractSchemas.createContract.title.split('_')[4]) {
      errors.push(`Title must be between ${ContractSchemas.createContract.title.split('_')[2]} and ${ContractSchemas.createContract.title.split('_')[4]} characters.`);
    }
    if (!request.parties || request.parties.length < 2) {
      errors.push('At least two parties are required for a contract.');
    }
    if (!request.terms || request.terms.length < ContractSchemas.createContract.terms.split('_')[2] || request.terms.length > ContractSchemas.createContract.terms.split('_')[4]) {
      errors.push(`At least ${ContractSchemas.createContract.terms.split('_')[2]} terms are required.`);
    }
    if (!request.validFrom || isNaN(new Date(request.validFrom).getTime())) {
      errors.push('Valid from date is required and must be a valid date.');
    }
    if (request.validUntil && new Date(request.validUntil) < new Date(request.validFrom)) {
      errors.push('Valid until date cannot be before valid from date.');
    }
    if (!request.organizationId) {
      errors.push('Organization ID is required.');
    }

    return { isValid: errors.length === 0, errors };
  }

  validateSignContract(request: SignContractRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!request.partyId) errors.push('Party ID is required.');
    if (!request.signatureData || request.signatureData.length !== 64) errors.push('Signature data must be 64 characters long.');
    if (!request.ipAddress || !Validators.isValidIPAddress(request.ipAddress)) errors.push('Valid IP address is required.'); // Assuming isValidIPAddress in shared validators
    return { isValid: errors.length === 0, errors };
  }

  validateAmendContract(request: AmendContractRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!request.reason || request.reason.length < 10) errors.push('Reason for amendment is required and must be at least 10 characters.');
    if (!request.changes) errors.push('Changes description is required.');
    if (request.newValidityUntil && new Date(request.newValidityUntil) < new Date()) errors.push('New validity until date cannot be in the past.');
    return { isValid: errors.length === 0, errors };
  }

  validateContractFilters(filters: ContractFilters): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    // Basic validation for pagination params, assuming shared validators or DTO validation handles most of this.
    if (filters.page && filters.page < 1) errors.push('Page number cannot be less than 1.');
    if (filters.limit && (filters.limit < 1 || filters.limit > 100)) errors.push('Limit must be between 1 and 100.');
    if (filters.status && !Object.values(ContractStatus).includes(filters.status)) errors.push('Invalid contract status.');
    return { isValid: errors.length === 0, errors };
  }

  validateContractStatusTransition(currentStatus: ContractStatus, newStatus: ContractStatus): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    // This would typically involve a state machine, which is now defined in src/domains/contracts/state/index.ts
    // For simplicity here, we'll check against a simple rule.
    // In a real system, you would integrate with ContractWorkflow.canTransition
    if (currentStatus === ContractStatus.TERMINATED || currentStatus === ContractStatus.EXPIRED) {
      errors.push(`Cannot transition from a ${currentStatus} status.`);
    }
    return { isValid: errors.length === 0, errors };
  }
}
