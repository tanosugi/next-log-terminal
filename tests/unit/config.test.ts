import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getLoggerConfig } from '../../src/config';

describe('Logger Configuration', () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.NEXT_PUBLIC_LOG_TIMESTAMP;
    delete process.env.NEXT_PUBLIC_LOG_FILENAME;
    delete process.env.NEXT_PUBLIC_LOG_LEVEL;
  });

  it('should return default configuration', () => {
    const config = getLoggerConfig();
    expect(config).toEqual({
      showTimestamp: true,
      showFileName: true,
      showLineNumber: true,
      showFunctionName: false,
      useColors: true,
      logLevel: 'log',
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
