import { z } from 'zod';

/**
 * Metric dimension definition schema
 */
export const DimensionDefinitionSchema = z.object({
  displayName: z.string(),
  index: z.number(),
  key: z.string(),
  name: z.string(),
  type: z.string(),
});

/**
 * Metric dimension cardinality schema
 */
export const DimensionCardinalitySchema = z.object({
  estimate: z.number(),
  key: z.string(),
  relative: z.number(),
});

/**
 * Default aggregation schema
 */
export const DefaultAggregationSchema = z.object({
  type: z.string(),
});

/**
 * Metric value type schema
 */
export const MetricValueTypeSchema = z.object({
  type: z.string(),
});

/**
 * Metric descriptor schema
 */
export const MetricDescriptorSchema = z.object({
  aggregationTypes: z.array(z.string()).optional(),
  created: z.number().optional(),
  dduBillable: z.boolean().optional(),
  billable: z.boolean().optional(),
  defaultAggregation: DefaultAggregationSchema.optional(),
  description: z.string().optional(),
  dimensionCardinalities: z.array(DimensionCardinalitySchema).optional(),
  dimensionDefinitions: z.array(DimensionDefinitionSchema).optional(),
  displayName: z.string().optional(),
  entityType: z.array(z.string()).optional(),
  lastWritten: z.number().optional(),
  latency: z.number().optional(),
  metricId: z.string(),
  metricValueType: MetricValueTypeSchema.optional(),
  minimumValue: z.number().optional(),
  maximumValue: z.number().optional(),
  rootCauseRelevant: z.boolean().optional(),
  impactRelevant: z.boolean().optional(),
  scalar: z.boolean().optional(),
  resolutionInfSupported: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  transformations: z.array(z.string()).optional(),
  unit: z.string().optional(),
});

/**
 * Metrics list response schema
 */
export const MetricsListResponseSchema = z.object({
  metrics: z.array(MetricDescriptorSchema),
  nextPageKey: z.string().optional(),
  totalCount: z.number(),
});

/**
 * Metric data point schema
 */
export const MetricDataPointSchema = z.object({
  dimensionMap: z.record(z.string()).optional(),
  dimensions: z.array(z.string()).optional(),
  timestamps: z.array(z.number()),
  values: z.array(z.number()),
});

/**
 * Metric query result schema
 */
export const MetricQueryResultSchema = z.object({
  data: z.array(MetricDataPointSchema),
  dataPointCountRatio: z.string().optional(),
  dimensionCountRatio: z.string().optional(),
  metricId: z.string(),
  warnings: z.array(z.string()).optional(),
});

/**
 * Metrics query response schema
 */
export const MetricsQueryResponseSchema = z.object({
  nextPageKey: z.string().optional(),
  resolution: z.string().optional(),
  result: z.array(MetricQueryResultSchema),
  totalCount: z.number(),
  warnings: z.array(z.string()).optional(),
});

/**
 * Invalid line schema for metric ingestion
 */
export const InvalidLineSchema = z.object({
  error: z.string(),
  line: z.number(),
});

/**
 * Changed metric key schema
 */
export const ChangedMetricKeySchema = z.object({
  line: z.number(),
  warning: z.string(),
});

/**
 * Ingestion warnings schema
 */
export const IngestionWarningsSchema = z.object({
  changedMetricKeys: z.array(ChangedMetricKeySchema).optional(),
  message: z.string().optional(),
});

/**
 * Metric ingestion response schema
 */
export const MetricIngestionResponseSchema = z.object({
  error: z.object({
    code: z.number(),
    invalidLines: z.array(InvalidLineSchema).optional(),
    message: z.string(),
  }).optional(),
  linesInvalid: z.number(),
  linesOk: z.number(),
  warnings: IngestionWarningsSchema.optional(),
});

/**
 * Unit schema
 */
export const UnitSchema = z.object({
  description: z.string().optional(),
  displayName: z.string().optional(),
  displayNamePlural: z.string().optional(),
  symbol: z.string().optional(),
  unitId: z.string(),
});

/**
 * Units list response schema
 */
export const UnitsListResponseSchema = z.object({
  totalCount: z.number(),
  units: z.array(UnitSchema),
});

/**
 * Unit conversion response schema
 */
export const UnitConversionResponseSchema = z.object({
  resultValue: z.number(),
  unitId: z.string(),
});

// Type exports
export type DimensionDefinition = z.infer<typeof DimensionDefinitionSchema>;
export type DimensionCardinality = z.infer<typeof DimensionCardinalitySchema>;
export type DefaultAggregation = z.infer<typeof DefaultAggregationSchema>;
export type MetricValueType = z.infer<typeof MetricValueTypeSchema>;
export type MetricDescriptor = z.infer<typeof MetricDescriptorSchema>;
export type MetricsListResponse = z.infer<typeof MetricsListResponseSchema>;
export type MetricDataPoint = z.infer<typeof MetricDataPointSchema>;
export type MetricQueryResult = z.infer<typeof MetricQueryResultSchema>;
export type MetricsQueryResponse = z.infer<typeof MetricsQueryResponseSchema>;
export type MetricIngestionResponse = z.infer<typeof MetricIngestionResponseSchema>;
export type Unit = z.infer<typeof UnitSchema>;
export type UnitsListResponse = z.infer<typeof UnitsListResponseSchema>;
export type UnitConversionResponse = z.infer<typeof UnitConversionResponseSchema>;

/**
 * Query parameters for metrics list
 */
export interface MetricsListQueryParams {
  nextPageKey?: string;
  pageSize?: number;
  metricSelector?: string;
  text?: string;
  fields?: string;
  writtenSince?: string;
  metadataSelector?: string;
}

/**
 * Query parameters for metrics query
 */
export interface MetricsQueryParams {
  metricSelector: string;
  resolution?: string;
  from?: string;
  to?: string;
  entitySelector?: string;
  mzSelector?: string;
}

/**
 * Query parameters for units list
 */
export interface UnitsListQueryParams {
  unitSelector?: string;
  fields?: string;
}

/**
 * Query parameters for unit conversion
 */
export interface UnitConversionParams {
  unitId: string;
  value: number;
  targetUnit?: string;
  numberFormat?: string;
}
