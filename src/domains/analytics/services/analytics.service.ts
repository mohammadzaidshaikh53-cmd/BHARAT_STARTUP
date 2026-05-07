import { EntityId } from '../../../shared/types';
import { OrganizationMetrics, EngagementMetrics } from '../types/analytics.types';
import { AnalyticsQueryDto } from '../dto/analytics.dto';

export interface IAnalyticsService {
  getOrgPerformance(orgId: EntityId, range: AnalyticsQueryDto): Promise<OrganizationMetrics>;
  getEngagementOverview(orgId: EntityId, range: AnalyticsQueryDto): Promise<EngagementMetrics>;
  trackEvent(eventName: string, properties: Record<string, any>): Promise<void>;
}
