/**
 * Project One Solution: Trust Domain Foundations
 */

import { EntityId, OrganizationScoped } from '../../shared/types';

export interface TrustScore extends OrganizationScoped {
  score: number; // 0-100
  breakdown: {
    verificationWeight: number;
    fulfillmentWeight: number;
    disputeWeight: number;
    longevityWeight: number;
  };
  updatedAt: Date;
}

export interface ReputationMetadata {
  totalTransactions: number;
  successfulFulfillments: number;
  activeDisputes: number;
  resolvedDisputes: number;
  averageRating: number;
}

/**
 * Trust Policy Contract
 */
export interface ITrustCalculator {
  calculateScore(orgId: EntityId): Promise<TrustScore>;
  getReputation(orgId: EntityId): Promise<ReputationMetadata>;
}
