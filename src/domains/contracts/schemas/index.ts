import { Schemas } from '../../../shared/schemas'; // Assuming shared schemas exist
import { CONTRACT_CONSTANTS } from '../constants';

export const ContractSchemas = {
  createContract: {
    title: `string_min_${CONTRACT_CONSTANTS.MIN_TITLE_LENGTH}_max_${CONTRACT_CONSTANTS.MAX_TITLE_LENGTH}`,
    description: 'string_optional',
    parties: 'array_min_2', // At least buyer and seller
    terms: `array_min_${CONTRACT_CONSTANTS.MIN_TERMS_COUNT}_max_${CONTRACT_CONSTANTS.MAX_TERMS_COUNT}`,
    validFrom: 'date_required',
    validUntil: 'date_optional_future',
    organizationId: Schemas.organization.id, // Assuming org ID schema exists
  },
  signContract: {
    partyId: 'string_required',
    signatureData: `string_min_${CONTRACT_CONSTANTS.DIGITAL_SIGNATURE_LENGTH}_max_${CONTRACT_CONSTANTS.DIGITAL_SIGNATURE_LENGTH}`,
    ipAddress: 'ipv4_or_ipv6_required',
    metadata: 'object_optional',
  },
  amendContract: {
    reason: 'string_min_10',
    changes: 'string_required',
    newTerms: 'array_optional',
    newValidityUntil: 'date_optional_future',
  },
  contractFilters: {
    ...Schemas.pagination,
    status: 'enum_ContractStatus_optional',
    partyId: 'string_optional',
    organizationId: Schemas.organization.id_optional,
  },
};

// Example of how to structure a runtime validator interface
export interface IContractSchemaValidator {
  validateCreateContract(data: any): { success: boolean; errors?: any };
  validateSignContract(data: any): { success: boolean; errors?: any };
  validateAmendContract(data: any): { success: boolean; errors?: any };
  validateContractFilters(data: any): { success: boolean; errors?: any };
}
