import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { DynatraceManagedConfig, DynatraceManagedClientOptions } from '../types/client.js';

/**
 * HTTP client for Dynatrace Managed API with token-based authentication
 */
export class DynatraceManagedClient {
  private readonly axiosInstance: AxiosInstance;
  private readonly config: DynatraceManagedConfig;

  constructor(options: DynatraceManagedClientOptions) {
    this.config = options.config;
    
    this.axiosInstance = axios.create({
      baseURL: `${this.config.url}/e/${this.config.environmentId}/api/v2`,
      timeout: this.config.timeout || 30000,
      headers: {
        'Authorization': `Api-Token ${this.config.apiToken}`,
        'Content-Type': 'application/json',
        'User-Agent': options.userAgent || 'dynatrace-managed-mcp/1.0.0',
      },
    });

    // Add request interceptor for logging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.log(`Making request to: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Retry logic for network errors
        if (
          error.code === 'ECONNABORTED' ||
          error.code === 'ENOTFOUND' ||
          error.code === 'ECONNRESET'
        ) {
          const retryCount = originalRequest._retryCount || 0;
          const maxRetries = this.config.maxRetries || 3;

          if (retryCount < maxRetries) {
            originalRequest._retryCount = retryCount + 1;
            const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, delay));
            return this.axiosInstance(originalRequest);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Make a GET request
   */
  async get<T>(path: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get<T>(path, config);
  }

  /**
   * Make a POST request
   */
  async post<T>(path: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post<T>(path, data, config);
  }

  /**
   * Make a PUT request
   */
  async put<T>(path: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.put<T>(path, data, config);
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(path: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.delete<T>(path, config);
  }

  /**
   * Test the connection to Dynatrace Managed cluster
   */
  async testConnection(): Promise<boolean> {
    try {
      // Try multiple endpoints to find working one
      const testEndpoints = [
        '/eventProperties',
        '/eventTypes', 
        '/events'
      ];
      
      for (const endpoint of testEndpoints) {
        try {
          console.error(`Testing endpoint: ${endpoint}`);
          await this.get(endpoint);
          console.error(`✅ Successfully connected using endpoint: ${endpoint}`);
          return true;
        } catch (error: any) {
          if (error.response?.status === 401 || error.response?.status === 403) {
            console.error(`❌ Authentication failed for ${endpoint}`);
            return false;
          }
          // 404 or other errors - try next endpoint
          console.error(`⚠️  Endpoint ${endpoint} not available (${error.response?.status || error.code})`);
        }
      }
      
      console.error('❌ No working endpoints found');
      return false;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  /**
   * Get the base URL for the client
   */
  getBaseUrl(): string {
    return `${this.config.url}/e/${this.config.environmentId}/api/v2`;
  }
}
