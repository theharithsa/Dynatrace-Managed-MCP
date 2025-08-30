import { DynatraceManagedConfig } from '../types/client.js';

/**
 * Get Dynatrace Managed configuration from environment variables
 */
export function getDynatraceManagedConfig(): DynatraceManagedConfig {
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
    url: url.endsWith('/') ? url.slice(0, -1) : url, // Remove trailing slash
    environmentId,
    apiToken,
    timeout: process.env.REQUEST_TIMEOUT ? parseInt(process.env.REQUEST_TIMEOUT) : 30000,
    maxRetries: process.env.MAX_RETRIES ? parseInt(process.env.MAX_RETRIES) : 3,
  };
}

/**
 * Validate that all required environment variables are set
 */
export function validateEnvironmentConfig(): void {
  const requiredVars = ['DYNATRACE_MANAGED_URL', 'DYNATRACE_ENVIRONMENT_ID', 'DYNATRACE_API_TOKEN'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env file or environment configuration.'
    );
  }
}
