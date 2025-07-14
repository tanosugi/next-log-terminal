import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getLoggerConfig } from '../../src/config';

describe('Logger Configuration', () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.NEXT_PUBLIC_LOG_TIMESTAMP;
    delete process.env.NEXT_PUBLIC_LOG_FILENAME;
    delete process.env.NEXT_PUBLIC_LOG_LEVEL;
    delete process.env.NEXT_PUBLIC_LOG_API_ENDPOINT;
  });

  it('should return default configuration', () => {
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

  it('should read configuration from environment variables', () => {
    process.env.NEXT_PUBLIC_LOG_TIMESTAMP = 'false';
    process.env.NEXT_PUBLIC_LOG_LEVEL = 'error';

    const config = getLoggerConfig();
    expect(config.showTimestamp).toBe(false);
    expect(config.logLevel).toBe('error');
  });
});
