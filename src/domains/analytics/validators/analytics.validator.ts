import { DateRangeDto } from '../dto/analytics.dto';
import { AggregationRequestDto } from '../dto/metrics.dto';

export const AnalyticsValidators = {
  isValidDateRange: (range: DateRangeDto): boolean => {
    const from = new Date(range.from);
    const to = new Date(range.to);
    return !isNaN(from.getTime()) && !isNaN(to.getTime()) && from <= to;
  },

  isValidAggregation: (request: AggregationRequestDto): boolean => {
    const allowedFunctions = ['sum', 'avg', 'min', 'max', 'count', 'unique'];
    return allowedFunctions.includes(request.function) && !!request.field;
  },

  isValidMetricName: (name: string): boolean => {
    return /^[a-z0-9._-]+$/.test(name);
  }
};
