/**
 * Project One Solution: Organization Verification Workflow Contracts
 */

export enum OrgVerificationState {
  IDLE = 'IDLE',
  DOCUMENTS_SUBMITTED = 'DOCUMENTS_SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  CLARIFICATION_REQUESTED = 'CLARIFICATION_REQUESTED',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export enum OrgVerificationEvent {
  SUBMIT = 'SUBMIT',
  START_REVIEW = 'START_REVIEW',
  REQUEST_CLARIFICATION = 'REQUEST_CLARIFICATION',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

export interface IVerificationGuard {
  isDocumentComplete(orgId: string): Promise<boolean>;
  isReviewerAuthorized(userId: string): Promise<boolean>;
}

export enum VerificationFailureReason {
  INVALID_DOCUMENTS = 'INVALID_DOCUMENTS',
  TAX_ID_MISMATCH = 'TAX_ID_MISMATCH',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  EXPIRED_LICENSE = 'EXPIRED_LICENSE',
}
