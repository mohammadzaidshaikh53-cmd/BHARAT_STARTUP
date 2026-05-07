import { EntityId, OrganizationScoped } from '../../../shared/types';

export interface UsageQuota extends OrganizationScoped {
  featureName: string;
  currentUsage: number;
  limit: number;
  resetDate?: Date;
}

export interface ResourceUsage extends OrganizationScoped {
  resourceId: EntityId;
  resourceType: string;
  consumption: number;
  unit: string;
  timestamp: Date;
}
