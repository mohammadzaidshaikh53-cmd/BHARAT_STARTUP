import { EntityId, OrganizationScoped } from '../../../shared/types';

export interface AnalyticsEvent extends OrganizationScoped {
  id: EntityId;
  eventName: string;
  actorId: EntityId;
  properties: Record<string, any>;
  timestamp: Date;
  sessionId?: string;
  context?: {
    pageUrl?: string;
    referrer?: string;
    userAgent?: string;
    ipAddress?: string;
  };
}

export interface UserActivity extends OrganizationScoped {
  userId: EntityId;
  lastActive: Date;
  activityType: string;
  metadata: Record<string, any>;
}
