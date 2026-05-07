import { EntityId } from '../../../shared/types';

export interface EngagementMetrics {
  views: number;
  clicks: number;
  shares: number;
  averageSessionDuration: number;
  bounceRate: number;
}

export interface ConversionMetrics {
  rfqToQuoteRatio: number;
  quoteToOrderRatio: number;
  totalConversionValue: number;
  averageDealCycleTime: number; // in days
}

export interface PerformanceMetrics {
  latency: number;
  throughput: number;
  errorRate: number;
}
