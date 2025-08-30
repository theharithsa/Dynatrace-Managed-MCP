import { getDynatraceManagedConfig, validateEnvironmentConfig } from './config';

describe('Configuration Utils', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('validateEnvironmentConfig', () => {
    it('should pass validation with all required environment variables', () => {
      process.env.DYNATRACE_MANAGED_URL = 'https://test.dynatrace.com';
      process.env.DYNATRACE_ENVIRONMENT_ID = 'test-env-id';
      process.env.DYNATRACE_API_TOKEN = 'test-token';

      expect(() => validateEnvironmentConfig()).not.toThrow();
    });

    it('should throw error when DYNATRACE_MANAGED_URL is missing', () => {
      delete process.env.DYNATRACE_MANAGED_URL;
      process.env.DYNATRACE_ENVIRONMENT_ID = 'test-env-id';
      process.env.DYNATRACE_API_TOKEN = 'test-token';

      expect(() => validateEnvironmentConfig()).toThrow('Missing required environment variables: DYNATRACE_MANAGED_URL');
    });

    it('should throw error when DYNATRACE_ENVIRONMENT_ID is missing', () => {
      process.env.DYNATRACE_MANAGED_URL = 'https://test.dynatrace.com';
      delete process.env.DYNATRACE_ENVIRONMENT_ID;
      process.env.DYNATRACE_API_TOKEN = 'test-token';

      expect(() => validateEnvironmentConfig()).toThrow('Missing required environment variables: DYNATRACE_ENVIRONMENT_ID');
    });

    it('should throw error when DYNATRACE_API_TOKEN is missing', () => {
      process.env.DYNATRACE_MANAGED_URL = 'https://test.dynatrace.com';
      process.env.DYNATRACE_ENVIRONMENT_ID = 'test-env-id';
      delete process.env.DYNATRACE_API_TOKEN;

      expect(() => validateEnvironmentConfig()).toThrow('Missing required environment variables: DYNATRACE_API_TOKEN');
    });

    it('should throw error when multiple required variables are missing', () => {
      delete process.env.DYNATRACE_MANAGED_URL;
      delete process.env.DYNATRACE_ENVIRONMENT_ID;
      delete process.env.DYNATRACE_API_TOKEN;

      expect(() => validateEnvironmentConfig()).toThrow('Missing required environment variables: DYNATRACE_MANAGED_URL, DYNATRACE_ENVIRONMENT_ID, DYNATRACE_API_TOKEN');
    });
  });

  describe('getDynatraceManagedConfig', () => {
    it('should return valid config with required environment variables', () => {
      process.env.DYNATRACE_MANAGED_URL = 'https://test.dynatrace.com';
      process.env.DYNATRACE_ENVIRONMENT_ID = 'test-env-id';
      process.env.DYNATRACE_API_TOKEN = 'test-token';

      const config = getDynatraceManagedConfig();

      expect(config.url).toBe('https://test.dynatrace.com');
      expect(config.environmentId).toBe('test-env-id');
      expect(config.apiToken).toBe('test-token');
      expect(config.timeout).toBe(30000); // default
      expect(config.maxRetries).toBe(3); // default
    });

    it('should remove trailing slash from URL', () => {
      process.env.DYNATRACE_MANAGED_URL = 'https://test.dynatrace.com/';
      process.env.DYNATRACE_ENVIRONMENT_ID = 'test-env-id';
      process.env.DYNATRACE_API_TOKEN = 'test-token';

      const config = getDynatraceManagedConfig();

      expect(config.url).toBe('https://test.dynatrace.com');
    });

    it('should use custom timeout and retries when provided', () => {
      process.env.DYNATRACE_MANAGED_URL = 'https://test.dynatrace.com';
      process.env.DYNATRACE_ENVIRONMENT_ID = 'test-env-id';
      process.env.DYNATRACE_API_TOKEN = 'test-token';
      process.env.REQUEST_TIMEOUT = '60000';
      process.env.MAX_RETRIES = '5';

      const config = getDynatraceManagedConfig();

      expect(config.timeout).toBe(60000);
      expect(config.maxRetries).toBe(5);
    });

    it('should throw error for invalid URL', () => {
      process.env.DYNATRACE_MANAGED_URL = 'invalid-url';
      process.env.DYNATRACE_ENVIRONMENT_ID = 'test-env-id';
      process.env.DYNATRACE_API_TOKEN = 'test-token';

      expect(() => getDynatraceManagedConfig()).toThrow('Invalid DYNATRACE_MANAGED_URL: invalid-url');
    });
  });
});
