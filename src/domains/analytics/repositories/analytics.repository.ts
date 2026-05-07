import { EntityId } from '../../../shared/types';
import { AnalyticsMetric } from '../types/analytics.types';
import { AnalyticsQueryDto } from '../dto/analytics.dto';
import { AggregationRequestDto } from '../dto/metrics.dto';

export interface IAnalyticsRepository {
  recordMetric(metric: Partial<AnalyticsMetric>): Promise<void>;
  queryMetrics(query: AnalyticsQueryDto): Promise<AnalyticsMetric[]>;
  aggregate(request: AggregationRequestDto, query: AnalyticsQueryDto): Promise<any>;
  getLatestForOrg(orgId: EntityId, metricName: string): Promise<AnalyticsMetric | null>;
}
