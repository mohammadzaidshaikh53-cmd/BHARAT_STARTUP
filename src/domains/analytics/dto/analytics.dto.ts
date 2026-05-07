import { PaginationParams } from '../../../shared/types';

export interface AnalyticsQueryDto {
  startTime: Date;
  endTime: Date;
  granularity?: 'hourly' | 'daily' | 'weekly' | 'monthly';
  metrics?: string[];
  dimensions?: string[];
  filters?: Record<string, any>;
}

export interface AnalyticsFilterDto {
  organizationId?: string;
  userId?: string;
  status?: string;
  type?: string;
}

export interface DateRangeDto {
  from: string; // ISO String
  to: string;   // ISO String
}
