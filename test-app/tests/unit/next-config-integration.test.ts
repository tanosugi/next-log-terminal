import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Import getLoggerConfig from relative path since it's not exported from the package
import { getLoggerConfig } from '../../../src/config';

describe('Next.js Config Integration', () => {
  // Store original environment variables
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    // Mock console methods to capture log output
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});

    // Mock fetch to prevent actual network calls in tests
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    // Clear environment variables
    delete process.env.NEXT_PUBLIC_LOG_TIMESTAMP;
    delete process.env.NEXT_PUBLIC_LOG_FILENAME;
    delete process.env.NEXT_PUBLIC_LOG_LINENUMBER;
    delete process.env.NEXT_PUBLIC_LOG_COLORS;
    delete process.env.NEXT_PUBLIC_LOG_LEVEL;
    delete process.env.NEXT_PUBLIC_LOG_API_ENDPOINT;
  });

  afterEach(() => {
    // Restore original environment variables
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  describe('next.config.js Environment Variables', () => {
    it('should read configuration from process.env set by next.config.js', () => {
      // Mock the environment variables that would be set by next.config.js
      process.env.NEXT_PUBLIC_LOG_TIMESTAMP = 'false';
      process.env.NEXT_PUBLIC_LOG_FILENAME = 'false';
      process.env.NEXT_PUBLIC_LOG_LINENUMBER = 'false';
      process.env.NEXT_PUBLIC_LOG_COLORS = 'false';
      process.env.NEXT_PUBLIC_LOG_LEVEL = 'debug';
      process.env.NEXT_PUBLIC_LOG_API_ENDPOINT = '/api/log-terminal';

      const config = getLoggerConfig();

      expect(config.showTimestamp).toBe(false);
      expect(config.showFileName).toBe(false);
      expect(config.showLineNumber).toBe(false);
      expect(config.useColors).toBe(false);
      expect(config.logLevel).toBe('debug');
      expect(config.apiEndpoint).toBe('/api/log-terminal');
    });

    it('should handle partial environment variable configuration', () => {
      // Only set some environment variables
      process.env.NEXT_PUBLIC_LOG_LEVEL = 'warn';
      process.env.NEXT_PUBLIC_LOG_COLORS = 'false';

      const config = getLoggerConfig();

      expect(config.logLevel).toBe('warn'); // From env
      expect(config.useColors).toBe(false); // From env
      expect(config.showTimestamp).toBe(true); // Default value
      expect(config.showFileName).toBe(true); // Default value
      expect(config.showLineNumber).toBe(true); // Default value
      expect(config.apiEndpoint).toBe('/api/log-terminal'); // Default value
    });

    it('should fall back to defaults when env vars not set', () => {
      // Clear all environment variables
      delete process.env.NEXT_PUBLIC_LOG_TIMESTAMP;
      delete process.env.NEXT_PUBLIC_LOG_FILENAME;
      delete process.env.NEXT_PUBLIC_LOG_LINENUMBER;
      delete process.env.NEXT_PUBLIC_LOG_COLORS;
      delete process.env.NEXT_PUBLIC_LOG_LEVEL;
      delete process.env.NEXT_PUBLIC_LOG_API_ENDPOINT;

      const config = getLoggerConfig();
      expect(config.logLevel).toBe('log'); // Default value
      expect(config.showTimestamp).toBe(true); // Default value
      expect(config.apiEndpoint).toBe('/api/log-terminal'); // Default value
    });

    it('should match actual next.config.js settings when enabled', () => {
      // Mock the current next.config.js settings (enabled state)
      process.env.NEXT_PUBLIC_LOG_TIMESTAMP = 'true';
      process.env.NEXT_PUBLIC_LOG_FILENAME = 'true';
      process.env.NEXT_PUBLIC_LOG_LINENUMBER = 'true';
      process.env.NEXT_PUBLIC_LOG_COLORS = 'true';
      process.env.NEXT_PUBLIC_LOG_LEVEL = 'debug';
      process.env.NEXT_PUBLIC_LOG_API_ENDPOINT = '/api/log-terminal';

      const config = getLoggerConfig();

      expect(config.showTimestamp).toBe(true);
      expect(config.showFileName).toBe(true);
      expect(config.showLineNumber).toBe(true);
      expect(config.useColors).toBe(true);
      expect(config.logLevel).toBe('debug');
      expect(config.apiEndpoint).toBe('/api/log-terminal');
    });

    it('should match actual next.config.js settings when disabled', () => {
      // Mock next.config.js settings with disabled display options
      process.env.NEXT_PUBLIC_LOG_TIMESTAMP = 'false';
      process.env.NEXT_PUBLIC_LOG_FILENAME = 'false';
      process.env.NEXT_PUBLIC_LOG_LINENUMBER = 'false';
      process.env.NEXT_PUBLIC_LOG_COLORS = 'false';
      process.env.NEXT_PUBLIC_LOG_LEVEL = 'debug';

      const config = getLoggerConfig();

      expect(config.showTimestamp).toBe(false);
      expect(config.showFileName).toBe(false);
      expect(config.showLineNumber).toBe(false);
      expect(config.useColors).toBe(false);
      expect(config.logLevel).toBe('debug');
    });

    it('should enable debug logging when logLevel is set to debug via env', async () => {
      process.env.NEXT_PUBLIC_LOG_LEVEL = 'debug';

      const { UnifiedLogger } = await import('../../../src/logger');
      const testLogger = new UnifiedLogger();

      testLogger.debug('Test debug message from env config');

      expect(console.log).toHaveBeenCalledWith(
        '%c[DEBUG]%c Test debug message from env config',
        'color: #6b7280; font-weight: bold;',
        'color: inherit;',
      );
    });

    it('should respect log level filtering from environment variables', async () => {
      process.env.NEXT_PUBLIC_LOG_LEVEL = 'error';

      const { UnifiedLogger } = await import('../../../src/logger');
      const testLogger = new UnifiedLogger();

      // Clear mocks to test filtering
      vi.clearAllMocks();

      testLogger.debug('Debug message'); // Should not log
      testLogger.info('Info message'); // Should not log
      testLogger.warn('Warn message'); // Should not log
      testLogger.error('Error message'); // Should log

      expect(console.log).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Error message');
    });

    it('should work with all supported log levels from env vars', () => {
      const logLevels = ['error', 'warn', 'info', 'log', 'debug'];

      logLevels.forEach((level) => {
        // Clear environment and set specific level
        delete process.env.NEXT_PUBLIC_LOG_LEVEL;
        process.env.NEXT_PUBLIC_LOG_LEVEL = level;

        const config = getLoggerConfig();
        expect(config.logLevel).toBe(level);
      });
    });

    it('should handle custom API endpoint from environment', () => {
      process.env.NEXT_PUBLIC_LOG_API_ENDPOINT = '/api/custom-logger';

      const config = getLoggerConfig();
      expect(config.apiEndpoint).toBe('/api/custom-logger');
    });

    it('should demonstrate complete next.config.js workflow', () => {
      // This test shows how next.config.js env property works

      // 1. next.config.js sets environment variables via env property
      process.env.NEXT_PUBLIC_LOG_TIMESTAMP = 'false';
      process.env.NEXT_PUBLIC_LOG_FILENAME = 'false';
      process.env.NEXT_PUBLIC_LOG_LINENUMBER = 'false';
      process.env.NEXT_PUBLIC_LOG_COLORS = 'false';
      process.env.NEXT_PUBLIC_LOG_LEVEL = 'debug';
      process.env.NEXT_PUBLIC_LOG_API_ENDPOINT = '/api/log-terminal';

      // 2. getLoggerConfig() reads from process.env
      const config = getLoggerConfig();

      // 3. Configuration is applied correctly
      expect(config).toMatchObject({
        showTimestamp: false,
        showFileName: false,
        showLineNumber: false,
        useColors: false,
        logLevel: 'debug',
        apiEndpoint: '/api/log-terminal',
      });

      // 4. This produces the minimal log format we observed
      expect(config.showTimestamp).toBe(false);
      expect(config.showFileName).toBe(false);
      expect(config.showLineNumber).toBe(false);
    });
  });
});
