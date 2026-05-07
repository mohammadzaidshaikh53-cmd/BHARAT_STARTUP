/**
 * Project One Solution: Analytics Schema Contracts
 */

export const AnalyticsSchemas = {
  metricQuery: {
    range: 'date_range',
    metrics: 'array_of_strings',
    groupBy: 'string_optional'
  },
  eventTracking: {
    name: 'string_required',
    properties: 'object_required'
  }
};

export interface IAnalyticsValidator {
  validateQuery(data: any): boolean;
  validateEvent(data: any): boolean;
}
