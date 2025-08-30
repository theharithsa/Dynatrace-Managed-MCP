import { z } from 'zod';

// Entity reference schema
export const EntityIdSchema = z.object({
  id: z.string(),
  type: z.string()
});

export const EntityReferenceSchema = z.object({
  entityId: EntityIdSchema,
  name: z.string()
});

// Tag schema
export const EntityTagSchema = z.object({
  context: z.string().optional(),
  key: z.string(),
  stringRepresentation: z.string(),
  value: z.string().optional()
});

// Evidence details schema
export const EvidenceDetailSchema = z.object({
  displayName: z.string(),
  entity: EntityReferenceSchema,
  groupingEntity: EntityReferenceSchema.optional(),
  rootCauseRelevant: z.boolean(),
  startTime: z.number()
});

export const EvidenceDetailsSchema = z.object({
  details: z.array(EvidenceDetailSchema),
  totalCount: z.number()
});

// Impact analysis schema
export const ImpactSchema = z.object({
  estimatedAffectedUsers: z.number(),
  impactedEntity: EntityReferenceSchema
});

export const ImpactAnalysisSchema = z.object({
  impacts: z.array(ImpactSchema)
});

// Management zone schema
export const ManagementZoneSchema = z.object({
  id: z.string(),
  name: z.string()
});

// Problem filter schema
export const ProblemFilterSchema = z.object({
  id: z.string(),
  name: z.string()
});

// Linked problem info schema
export const LinkedProblemInfoSchema = z.object({
  displayId: z.string(),
  problemId: z.string()
});

// Comment schema
export const CommentSchema = z.object({
  authorName: z.string(),
  content: z.string(),
  context: z.string().optional(),
  createdAtTimestamp: z.number(),
  id: z.string()
});

// Recent comments schema
export const RecentCommentsSchema = z.object({
  comments: z.array(CommentSchema),
  nextPageKey: z.string().optional(),
  pageSize: z.number(),
  totalCount: z.number()
});

// Problem status and severity enums
export const ProblemStatusSchema = z.enum(['OPEN', 'CLOSED']);
export const SeverityLevelSchema = z.enum(['AVAILABILITY', 'CUSTOM_ALERT', 'ERROR', 'PERFORMANCE', 'RESOURCE_CONTENTION', 'MONITORING_UNAVAILABLE']);
export const ImpactLevelSchema = z.enum(['APPLICATION', 'ENVIRONMENT', 'INFRASTRUCTURE', 'SERVICE']);

// Main Problem schema
export const ProblemSchema = z.object({
  affectedEntities: z.array(EntityReferenceSchema),
  displayId: z.string(),
  endTime: z.number().optional(),
  entityTags: z.array(EntityTagSchema),
  evidenceDetails: EvidenceDetailsSchema.optional(),
  impactAnalysis: ImpactAnalysisSchema.optional(),
  impactLevel: ImpactLevelSchema,
  impactedEntities: z.array(EntityReferenceSchema),
  'k8s.cluster.name': z.array(z.string()).optional(),
  'k8s.cluster.uid': z.array(z.string()).optional(),
  'k8s.namespace.name': z.array(z.string()).optional(),
  linkedProblemInfo: LinkedProblemInfoSchema.optional(),
  managementZones: z.array(ManagementZoneSchema),
  problemFilters: z.array(ProblemFilterSchema),
  problemId: z.string(),
  recentComments: RecentCommentsSchema.optional(),
  rootCauseEntity: EntityReferenceSchema.optional(),
  severityLevel: SeverityLevelSchema,
  startTime: z.number(),
  status: ProblemStatusSchema,
  title: z.string()
});

// Problems list response schema
export const ProblemsListResponseSchema = z.object({
  nextPageKey: z.string().optional(),
  pageSize: z.number(),
  problems: z.array(ProblemSchema),
  totalCount: z.number(),
  warnings: z.array(z.string()).optional()
});

// Comments list response schema
export const CommentsListResponseSchema = z.object({
  comments: z.array(CommentSchema),
  nextPageKey: z.string().optional(),
  pageSize: z.number(),
  totalCount: z.number()
});

// Comment request schemas
export const AddCommentRequestSchema = z.object({
  context: z.string().optional(),
  message: z.string()
});

export const UpdateCommentRequestSchema = z.object({
  context: z.string().optional(),
  message: z.string()
});

// Close problem request schema
export const CloseProblemRequestSchema = z.object({
  message: z.string()
});

// Close problem response schema
export const CloseProblemResponseSchema = z.object({
  closeTimestamp: z.number(),
  closing: z.boolean(),
  comment: CommentSchema,
  problemId: z.string()
});

// TypeScript type exports
export type EntityId = z.infer<typeof EntityIdSchema>;
export type EntityReference = z.infer<typeof EntityReferenceSchema>;
export type EntityTag = z.infer<typeof EntityTagSchema>;
export type EvidenceDetail = z.infer<typeof EvidenceDetailSchema>;
export type EvidenceDetails = z.infer<typeof EvidenceDetailsSchema>;
export type Impact = z.infer<typeof ImpactSchema>;
export type ImpactAnalysis = z.infer<typeof ImpactAnalysisSchema>;
export type ManagementZone = z.infer<typeof ManagementZoneSchema>;
export type ProblemFilter = z.infer<typeof ProblemFilterSchema>;
export type LinkedProblemInfo = z.infer<typeof LinkedProblemInfoSchema>;
export type Comment = z.infer<typeof CommentSchema>;
export type RecentComments = z.infer<typeof RecentCommentsSchema>;
export type ProblemStatus = z.infer<typeof ProblemStatusSchema>;
export type SeverityLevel = z.infer<typeof SeverityLevelSchema>;
export type ImpactLevel = z.infer<typeof ImpactLevelSchema>;
export type Problem = z.infer<typeof ProblemSchema>;
export type ProblemsListResponse = z.infer<typeof ProblemsListResponseSchema>;
export type CommentsListResponse = z.infer<typeof CommentsListResponseSchema>;
export type AddCommentRequest = z.infer<typeof AddCommentRequestSchema>;
export type UpdateCommentRequest = z.infer<typeof UpdateCommentRequestSchema>;
export type CloseProblemRequest = z.infer<typeof CloseProblemRequestSchema>;
export type CloseProblemResponse = z.infer<typeof CloseProblemResponseSchema>;

// Query parameter interfaces
export interface ListProblemsParams {
  fields?: string;
  nextPageKey?: string;
  pageSize?: number;
  from?: string;
  to?: string;
  problemSelector?: string;
  entitySelector?: string;
  sort?: string;
}

export interface GetProblemParams {
  fields?: string;
}

export interface ListCommentsParams {
  nextPageKey?: string;
  pageSize?: number;
}
