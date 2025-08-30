export interface DynatraceManagedConfig {
  /** Dynatrace Managed cluster URL */
  url: string;
  /** Environment ID for API calls */
  environmentId: string;
  /** API token for authentication */
  apiToken: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Maximum number of retries for failed requests */
  maxRetries?: number;
}

export interface DynatraceManagedClientOptions {
  config: DynatraceManagedConfig;
  userAgent?: string;
}
