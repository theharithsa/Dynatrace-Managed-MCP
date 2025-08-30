import { z } from 'zod';

// Environment Info schemas
export const ClusterVersionSchema = z.object({
  version: z.string()
});

export const ClusterTimeSchema = z.string();

export const EnvironmentInfoSchema = z.object({
  environmentId: z.string(),
  clusterVersion: ClusterVersionSchema,
  clusterTime: z.number(),
  clusterTimeUtc: z.string(),
  baseUrl: z.string()
});

// Type exports
export type ClusterVersion = z.infer<typeof ClusterVersionSchema>;
export type ClusterTime = z.infer<typeof ClusterTimeSchema>;
export type EnvironmentInfo = z.infer<typeof EnvironmentInfoSchema>;
