import { z } from 'zod';

// Event Property schemas
export const EventPropertySchema = z.object({
  description: z.string(),
  displayName: z.string(),
  filterable: z.boolean(),
  key: z.string(),
  writable: z.boolean()
});

export const EventPropertiesResponseSchema = z.object({
  eventProperties: z.array(EventPropertySchema),
  nextPageKey: z.string().optional(),
  pageSize: z.number(),
  totalCount: z.number()
});

// Event Type schemas
export const EventTypeInfoSchema = z.object({
  description: z.string().optional(),
  displayName: z.string(),
  severityLevel: z.enum(['AVAILABILITY', 'CUSTOM_ALERT', 'ERROR', 'INFO', 'MONITORING_UNAVAILABLE', 'PERFORMANCE', 'RESOURCE', 'RESOURCE_CONTENTION']),
  type: z.string()
});

export const EventTypesResponseSchema = z.object({
  eventTypeInfos: z.array(EventTypeInfoSchema),
  nextPageKey: z.string().optional(),
  pageSize: z.number(),
  totalCount: z.number()
});

// Event schemas
export const EntityIdSchema = z.object({
  entityId: z.object({
    id: z.string(),
    type: z.string()
  }),
  name: z.string()
});

export const EntityTagSchema = z.object({
  context: z.string(),
  key: z.string(),
  stringRepresentation: z.string(),
  value: z.string().optional()
});

export const ManagementZoneSchema = z.object({
  id: z.string(),
  name: z.string()
});

export const EventPropertyValueSchema = z.object({
  key: z.string(),
  value: z.string()
});

export const EventSchema = z.object({
  correlationId: z.string(),
  endTime: z.number().optional(),
  entityId: EntityIdSchema,
  entityTags: z.array(EntityTagSchema).optional(),
  eventId: z.string(),
  eventType: z.string(),
  frequentEvent: z.boolean(),
  managementZones: z.array(ManagementZoneSchema).optional(),
  properties: z.array(EventPropertyValueSchema).optional(),
  startTime: z.number(),
  status: z.enum(['OPEN', 'CLOSED']),
  suppressAlert: z.boolean(),
  suppressProblem: z.boolean(),
  title: z.string(),
  underMaintenance: z.boolean()
});

export const EventsResponseSchema = z.object({
  events: z.array(EventSchema),
  nextPageKey: z.string().optional(),
  pageSize: z.number(),
  totalCount: z.number(),
  warnings: z.array(z.string()).optional()
});

// Event Ingest schemas
export const EventIngestRequestSchema = z.object({
  endTime: z.number().optional(),
  entitySelector: z.string(),
  eventType: z.enum(['AVAILABILITY_EVENT', 'CUSTOM_ALERT', 'ERROR_EVENT', 'INFO_EVENT', 'PERFORMANCE_EVENT', 'RESOURCE_CONTENTION_EVENT']),
  properties: z.record(z.string()).optional(),
  startTime: z.number(),
  timeout: z.number().optional(),
  title: z.string()
});

export const EventIngestResultSchema = z.object({
  correlationId: z.string(),
  status: z.enum(['OK', 'INVALID_ENTITY_TYPE', 'INVALID_EVENT_TYPE', 'INVALID_PROPERTY', 'ENTITY_NOT_FOUND', 'TIMEOUT'])
});

export const EventIngestResponseSchema = z.object({
  eventIngestResults: z.array(EventIngestResultSchema),
  reportCount: z.number()
});

// API Error schema
export const ConstraintViolationSchema = z.object({
  location: z.string(),
  message: z.string(),
  parameterLocation: z.enum(['HEADER', 'PATH', 'QUERY', 'BODY']),
  path: z.string()
});

export const ApiErrorSchema = z.object({
  error: z.object({
    code: z.number(),
    constraintViolations: z.array(ConstraintViolationSchema).optional(),
    message: z.string()
  })
});

// Type exports
export type EventProperty = z.infer<typeof EventPropertySchema>;
export type EventPropertiesResponse = z.infer<typeof EventPropertiesResponseSchema>;
export type EventTypeInfo = z.infer<typeof EventTypeInfoSchema>;
export type EventTypesResponse = z.infer<typeof EventTypesResponseSchema>;
export type Event = z.infer<typeof EventSchema>;
export type EventsResponse = z.infer<typeof EventsResponseSchema>;
export type EventIngestRequest = z.infer<typeof EventIngestRequestSchema>;
export type EventIngestResponse = z.infer<typeof EventIngestResponseSchema>;
export type ApiError = z.infer<typeof ApiErrorSchema>;
