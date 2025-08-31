/**
 * Environment configuration for Dynatrace Managed
 * Following SaaS MCP pattern
 */
export interface DynatraceEnv {
  url: string;
  environmentId: string;
  apiToken: string;
}

/**
 * Get Dynatrace environment configuration from environment variables
 */
export function getDynatraceEnv(): DynatraceEnv {
  const url = process.env.DYNATRACE_MANAGED_URL;
  const environmentId = process.env.DYNATRACE_ENVIRONMENT_ID;
  const apiToken = process.env.DYNATRACE_API_TOKEN;

  if (!url) {
    throw new Error('DYNATRACE_MANAGED_URL environment variable is required');
  }

  if (!environmentId) {
    throw new Error('DYNATRACE_ENVIRONMENT_ID environment variable is required');
  }

  if (!apiToken) {
    throw new Error('DYNATRACE_API_TOKEN environment variable is required');
  }

  // Validate URL format
  try {
    new URL(url);
  } catch (error) {
    throw new Error(`Invalid DYNATRACE_MANAGED_URL: ${url}`);
  }

  return {
    url,
    environmentId,
    apiToken,
  };
}
