export interface AggregationRequestDto {
  field: string;
  function: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'unique';
  groupBy?: string[];
}

export interface MetricExportDto {
  format: 'json' | 'csv' | 'xlsx';
  includeMetadata: boolean;
  compression?: boolean;
}
