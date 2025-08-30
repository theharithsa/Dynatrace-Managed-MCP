import { z } from 'zod';

/**
 * Entity icon schema
 */
export const EntityIconSchema = z.object({
  customIconPath: z.string().optional(),
  primaryIconType: z.string().optional(),
  secondaryIconType: z.string().optional(),
});

/**
 * Management zone schema
 */
export const ManagementZoneSchema = z.object({
  id: z.string(),
  name: z.string(),
});

/**
 * Entity tag schema
 */
export const EntityTagSchema = z.object({
  context: z.string(),
  key: z.string(),
  stringRepresentation: z.string(),
  value: z.string().optional(),
});

/**
 * Entity relationship reference schema
 */
export const EntityRelationshipRefSchema = z.object({
  id: z.string(),
  type: z.string(),
});

/**
 * Entity relationships schema
 */
export const EntityRelationshipsSchema = z.record(z.array(EntityRelationshipRefSchema));

/**
 * Entity schema
 */
export const EntitySchema = z.object({
  displayName: z.string(),
  entityId: z.string(),
  firstSeenTms: z.number().optional(),
  fromRelationships: EntityRelationshipsSchema.optional(),
  icon: EntityIconSchema.optional(),
  lastSeenTms: z.number().optional(),
  managementZones: z.array(ManagementZoneSchema).optional(),
  properties: z.record(z.unknown()).optional(),
  tags: z.array(EntityTagSchema).optional(),
  toRelationships: EntityRelationshipsSchema.optional(),
  type: z.string(),
});

/**
 * Entities list response schema
 */
export const EntitiesListResponseSchema = z.object({
  entities: z.array(EntitySchema),
  nextPageKey: z.string().optional(),
  pageSize: z.number(),
  totalCount: z.number(),
});

/**
 * Entity property schema
 */
export const EntityPropertySchema = z.object({
  id: z.string(),
  type: z.string(),
});

/**
 * Entity relationship type schema
 */
export const EntityRelationshipTypeSchema = z.object({
  id: z.string(),
  toTypes: z.array(z.string()).optional(),
  fromTypes: z.array(z.string()).optional(),
});

/**
 * Entity type schema
 */
export const EntityTypeSchema = z.object({
  entityLimitExceeded: z.string(),
  fromRelationships: z.array(EntityRelationshipTypeSchema).optional(),
  managementZones: z.string(),
  properties: z.array(EntityPropertySchema).optional(),
  tags: z.string(),
  toRelationships: z.array(EntityRelationshipTypeSchema).optional(),
  type: z.string(),
});

/**
 * Entity types list response schema
 */
export const EntityTypesListResponseSchema = z.object({
  nextPageKey: z.string().optional(),
  pageSize: z.number(),
  totalCount: z.number(),
  types: z.array(EntityTypeSchema),
});

/**
 * Custom device schema
 */
export const CustomDeviceSchema = z.object({
  configUrl: z.string().optional(),
  customDeviceId: z.string().optional(),
  displayName: z.string(),
  dnsNames: z.array(z.string()).optional(),
  faviconUrl: z.string().optional(),
  group: z.string().optional(),
  ipAddresses: z.array(z.string()).optional(),
  listenPorts: z.array(z.number()).optional(),
  properties: z.record(z.unknown()).optional(),
  type: z.string(),
});

/**
 * Custom device creation response schema
 */
export const CustomDeviceCreationResponseSchema = z.object({
  entityId: z.string(),
  groupId: z.string().optional(),
});

// Type exports
export type EntityIcon = z.infer<typeof EntityIconSchema>;
export type ManagementZone = z.infer<typeof ManagementZoneSchema>;
export type EntityTag = z.infer<typeof EntityTagSchema>;
export type EntityRelationshipRef = z.infer<typeof EntityRelationshipRefSchema>;
export type EntityRelationships = z.infer<typeof EntityRelationshipsSchema>;
export type Entity = z.infer<typeof EntitySchema>;
export type EntitiesListResponse = z.infer<typeof EntitiesListResponseSchema>;
export type EntityProperty = z.infer<typeof EntityPropertySchema>;
export type EntityRelationshipType = z.infer<typeof EntityRelationshipTypeSchema>;
export type EntityType = z.infer<typeof EntityTypeSchema>;
export type EntityTypesListResponse = z.infer<typeof EntityTypesListResponseSchema>;
export type CustomDevice = z.infer<typeof CustomDeviceSchema>;
export type CustomDeviceCreationResponse = z.infer<typeof CustomDeviceCreationResponseSchema>;

/**
 * Query parameters for entities list
 */
export interface EntitiesListQueryParams {
  nextPageKey?: string;
  pageSize?: number;
  entitySelector?: string;
  from?: string;
  to?: string;
  fields?: string;
  sort?: string;
}

/**
 * Query parameters for single entity
 */
export interface EntityQueryParams {
  entityId: string;
  from?: string;
  to?: string;
  fields?: string;
}

/**
 * Query parameters for entity types list
 */
export interface EntityTypesListQueryParams {
  nextPageKey?: string;
  pageSize?: number;
}

/**
 * Query parameters for custom device creation
 */
export interface CustomDeviceCreationParams {
  uiBased?: boolean;
  device: CustomDevice;
}

/**
 * Request parameters for creating custom device via MCP
 */
export interface CreateCustomDeviceRequest {
  customDeviceId: string;
  displayName: string;
  ipAddresses?: string[];
  listenPorts?: number[];
  type?: string;
  favicon?: string;
  configUrl?: string;
  properties?: Record<string, string>;
  tags?: Array<{
    key: string;
    value?: string;
  }>;
}

/**
 * Tag for tagging operations
 */
export const TagSchema = z.object({
  context: z.string().optional(),
  key: z.string(),
  value: z.string().optional(),
  stringRepresentation: z.string().optional(),
});

/**
 * Tags list response schema
 */
export const TagsListResponseSchema = z.object({
  tags: z.array(TagSchema),
  totalCount: z.number(),
});

/**
 * Add tags request schema
 */
export const AddTagsRequestSchema = z.object({
  tags: z.array(z.object({
    key: z.string(),
    value: z.string().optional(),
  })),
});

/**
 * Add tags response schema
 */
export const AddTagsResponseSchema = z.object({
  appliedTags: z.array(TagSchema),
  matchedEntitiesCount: z.number(),
});

/**
 * Delete tags response schema
 */
export const DeleteTagsResponseSchema = z.object({
  matchedEntitiesCount: z.number(),
});

/**
 * Monitoring state parameter schema
 */
export const MonitoringStateParameterSchema = z.object({
  key: z.string(),
  value: z.string(),
});

/**
 * Monitoring state schema
 */
export const MonitoringStateSchema = z.object({
  entityId: z.string(),
  parameters: z.array(MonitoringStateParameterSchema).optional(),
  severity: z.string(),
  state: z.string(),
});

/**
 * Monitoring states group schema
 */
export const MonitoringStatesGroupSchema = z.object({
  states: z.array(MonitoringStateSchema),
});

/**
 * Monitoring states response schema
 */
export const MonitoringStatesResponseSchema = z.object({
  monitoringStates: z.array(MonitoringStatesGroupSchema),
  totalCount: z.number(),
  nextPageKey: z.string().optional(),
});

// Type exports for tags and monitoring
export type Tag = z.infer<typeof TagSchema>;
export type TagsListResponse = z.infer<typeof TagsListResponseSchema>;
export type AddTagsRequest = z.infer<typeof AddTagsRequestSchema>;
export type AddTagsResponse = z.infer<typeof AddTagsResponseSchema>;
export type DeleteTagsResponse = z.infer<typeof DeleteTagsResponseSchema>;
export type MonitoringStateParameter = z.infer<typeof MonitoringStateParameterSchema>;
export type MonitoringState = z.infer<typeof MonitoringStateSchema>;
export type MonitoringStatesGroup = z.infer<typeof MonitoringStatesGroupSchema>;
export type MonitoringStatesResponse = z.infer<typeof MonitoringStatesResponseSchema>;

/**
 * Query parameters for tags operations
 */
export interface TagsQueryParams {
  entitySelector: string;
  from?: string;
  to?: string;
}

/**
 * Query parameters for delete tags
 */
export interface DeleteTagsQueryParams extends TagsQueryParams {
  key: string;
  value?: string;
  deleteAllWithKey?: boolean;
}

/**
 * Query parameters for add tags
 */
export interface AddTagsQueryParams extends TagsQueryParams {
  tags: Array<{
    key: string;
    value?: string;
  }>;
}

/**
 * Query parameters for monitoring states
 */
export interface MonitoringStatesQueryParams {
  nextPageKey?: string;
  pageSize?: number;
  entitySelector?: string;
  from?: string;
  to?: string;
}
