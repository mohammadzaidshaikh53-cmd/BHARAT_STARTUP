export enum AnalyticsProcessingState {
  IDLE = 'IDLE',
  COLLECTING = 'COLLECTING',
  PROCESSING = 'PROCESSING',
  AGGREGATING = 'AGGREGATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface IAnalyticsState {
  lastSyncTimestamp: Date;
  queueSize: number;
  status: AnalyticsProcessingState;
  errors?: string[];
}
