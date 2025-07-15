import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getLoggerConfig } from '../../src/config';

describe('Logger Configuration', () => {
  beforeEach(() => {
    vi.resetModules();
    // Clear environment variables
    delete process.env.NEXT_PUBLIC_LOG_TIMESTAMP;
    delete process.env.NEXT_PUBLIC_LOG_FILENAME;
    delete process.env.NEXT_PUBLIC_LOG_LINENUMBER;
    delete process.env.NEXT_PUBLIC_LOG_COLORS;
    delete process.env.NEXT_PUBLIC_LOG_LEVEL;
    delete process.env.NEXT_PUBLIC_LOG_API_ENDPOINT;
  });

  it('should return default configuration when no env vars set', () => {
    const config = getLoggerConfig();
    expect(config).toEqual({
      showTimestamp: true,
      showFileName: true,
      showLineNumber: true,
      useColors: true,
      logLevel: 'log',
      apiEndpoint: '/api/log-terminal',
    });
  });

  it('should use environment variables for configuration', () => {
    process.env.NEXT_PUBLIC_LOG_TIMESTAMP = 'false';
    process.env.NEXT_PUBLIC_LOG_LEVEL = 'error';
    process.env.NEXT_PUBLIC_LOG_API_ENDPOINT = '/api/custom-log';

    const config = getLoggerConfig();
    expect(config.showTimestamp).toBe(false);
    expect(config.logLevel).toBe('error');
    expect(config.apiEndpoint).toBe('/api/custom-log');
    expect(config.showFileName).toBe(true); // Should keep default value
    expect(config.useColors).toBe(true); // Should keep default value
  });
});
