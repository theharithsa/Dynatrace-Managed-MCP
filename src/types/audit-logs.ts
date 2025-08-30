import { z } from 'zod';

/**
 * Audit log patch operation schema
 */
export const AuditLogPatchSchema = z.object({
  oldValue: z.unknown().optional(),
  op: z.string(),
  path: z.string(),
  value: z.unknown().optional(),
});

/**
 * Audit log entry schema
 */
export const AuditLogEntrySchema = z.object({
  category: z.string(),
  entityId: z.string().optional(),
  environmentId: z.string(),
  eventType: z.string(),
  logId: z.string(),
  patch: z.array(AuditLogPatchSchema).optional(),
  success: z.boolean(),
  timestamp: z.number(),
  user: z.string(),
  userOrigin: z.string().optional(),
  userType: z.string(),
});

/**
 * Audit logs response schema
 */
export const AuditLogsResponseSchema = z.object({
  auditLogs: z.array(AuditLogEntrySchema),
  nextPageKey: z.string().optional(),
  pageSize: z.number(),
  totalCount: z.number(),
});

// Type exports
export type AuditLogPatch = z.infer<typeof AuditLogPatchSchema>;
export type AuditLogEntry = z.infer<typeof AuditLogEntrySchema>;
export type AuditLogsResponse = z.infer<typeof AuditLogsResponseSchema>;

/**
 * Audit logs query parameters
 */
export interface AuditLogsQueryParams {
  nextPageKey?: string;
  pageSize?: number;
  filter?: string;
  from?: string;
  to?: string;
  sort?: string;
}
