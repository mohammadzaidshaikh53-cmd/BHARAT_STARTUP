import { EntityId, OrganizationScoped } from '../../../shared/types';

export enum MetricType {
  COUNTER = 'COUNTER',
  GAUGE = 'GAUGE',
  HISTOGRAM = 'HISTOGRAM',
  SUMMARY = 'SUMMARY',
}

export interface AnalyticsMetric extends OrganizationScoped {
  id: EntityId;
  name: string;
  type: MetricType;
  value: number;
  labels?: Record<string, string>;
  timestamp: Date;
}

export interface OrganizationMetrics extends OrganizationScoped {
  activeUsers: number;
  totalTransactions: number;
  rfqCount: number;
  marketplaceEngagement: number;
  trustScoreHistory: number[];
}
