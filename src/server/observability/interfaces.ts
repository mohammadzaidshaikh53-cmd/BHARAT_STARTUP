/**
 * Project One Solution: Observability Contracts
 */

export interface ITraceContext {
  traceId: string;
  spanId: string;
  parentId?: string;
}

export interface ITelemetryService {
  startSpan(name: string, context?: ITraceContext): ITraceContext;
  endSpan(context: ITraceContext): void;
  recordException(error: Error, metadata?: any): void;
  setTag(key: string, value: string): void;
}

/**
 * Request Correlation
 * Tracks requests across distributed systems.
 */
export interface ICorrelationProvider {
  getCorrelationId(): string;
  setCorrelationId(id: string): void;
}

export interface IPerformanceMonitor {
  mark(name: string): void;
  measure(name: string, startMark: string, endMark: string): void;
}
