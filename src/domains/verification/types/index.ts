/**
 * Project One Solution: Verification Domain Foundations
 */

import { EntityId, OrganizationScoped } from '../../shared/types';

export enum VerificationStatus {
  NOT_STARTED = 'NOT_STARTED',
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export enum VerificationType {
  IDENTITY = 'IDENTITY',
  BUSINESS_REGISTRATION = 'BUSINESS_REGISTRATION',
  TAX_COMPLIANCE = 'TAX_COMPLIANCE',
  BANK_ACCOUNT = 'BANK_ACCOUNT',
  INDUSTRY_CERTIFICATION = 'INDUSTRY_CERTIFICATION',
}

export interface VerificationDocument {
  id: EntityId;
  type: string;
  fileUrl: string;
  expiryDate?: Date;
  metadata?: Record<string, any>;
}

export interface VerificationAttempt extends OrganizationScoped {
  id: EntityId;
  type: VerificationType;
  status: VerificationStatus;
  documents: VerificationDocument[];
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: EntityId;
  notes?: string;
}

/**
 * Future Scaling:
 * This will integrate with external KYC/KYB providers.
 */
export interface IVerificationService {
  submit(attempt: Partial<VerificationAttempt>): Promise<VerificationAttempt>;
  getLatestStatus(orgId: EntityId, type: VerificationType): Promise<VerificationStatus>;
}
