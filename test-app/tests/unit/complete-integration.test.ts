import { logger, UnifiedLogger } from 'next-log-terminal';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Complete next-log-terminal Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window to simulate client-side environment
    Object.defineProperty(global, 'window', {
      value: { location: { pathname: '/test' } },
      writable: true,
    });
    // Mock fetch for logToServer calls
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  describe('Package Export Tests', () => {
    it('should export logger instance', () => {
      expect(logger).toBeDefined();
      expect(logger).toBeInstanceOf(UnifiedLogger);
    });

    it('should export UnifiedLogger class', () => {
      expect(UnifiedLogger).toBeDefined();
      expect(typeof UnifiedLogger).toBe('function');
    });

    it('should allow creating new logger instances', () => {
      const customLogger = new UnifiedLogger();
      expect(customLogger).toBeInstanceOf(UnifiedLogger);
      expect(customLogger).not.toBe(logger);
    });
  });

  describe('Comprehensive Logging Tests', () => {
    it('should handle log levels with default configuration', () => {
      logger.debug('Debug message'); // Won't log with default 'log' level
      logger.log('Log message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');

      // Debug should not log with default 'log' level
      expect(console.log).not.toHaveBeenCalledWith(
        '%c[DEBUG]%c Debug message',
        'color: #6b7280; font-weight: bold;',
        'color: inherit;',
      );
      expect(console.log).toHaveBeenCalledWith('Log message');
      expect(console.info).toHaveBeenCalledWith('Info message');
      expect(console.warn).toHaveBeenCalledWith('Warning message');
      expect(console.error).toHaveBeenCalledWith('Error message');
    });

    it('should handle complex data structures', () => {
      const testData = {
        user: { id: 1, name: 'Test User' },
        nested: { deep: { value: 'test' } },
        array: [1, 2, { id: 3 }],
        date: new Date('2024-01-01'),
        null: null,
        undefined: undefined,
      };

      logger.info('Complex data test', testData);
      expect(console.info).toHaveBeenCalledWith('Complex data test', testData);
    });

    it('should handle error objects properly', () => {
      const error = new Error('Test error message');
      error.stack = 'Error stack trace';

      logger.error('Error occurred', error);
      expect(console.error).toHaveBeenCalledWith('Error occurred', error);
    });
  });

  describe('Default Configuration Tests', () => {
    it('should work with default configuration', () => {
      const customLogger = new UnifiedLogger();

      // With default configuration, only log level and above should work
      customLogger.debug('Debug message'); // Won't log with default 'log' level
      customLogger.log('Log message'); // This should log
      customLogger.info('Info message');
      customLogger.warn('Warning message');
      customLogger.error('Error message');

      expect(console.log).toHaveBeenCalledWith('Log message');
      expect(console.info).toHaveBeenCalledWith('Info message');
      expect(console.warn).toHaveBeenCalledWith('Warning message');
      expect(console.error).toHaveBeenCalledWith('Error message');
    });

    it('should handle multiple logger instances', () => {
      const customLogger1 = new UnifiedLogger();
      const customLogger2 = new UnifiedLogger();

      vi.clearAllMocks();

      // Test both loggers work independently
      customLogger1.info('Logger 1 message');
      customLogger2.warn('Logger 2 message');

      expect(console.info).toHaveBeenCalledWith('Logger 1 message');
      expect(console.warn).toHaveBeenCalledWith('Logger 2 message');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty messages', () => {
      logger.info('');
      logger.log('');
      logger.warn('');
      logger.error('');

      expect(console.info).toHaveBeenCalledWith('');
      expect(console.log).toHaveBeenCalledWith('');
      expect(console.warn).toHaveBeenCalledWith('');
      expect(console.error).toHaveBeenCalledWith('');
    });

    it('should handle no additional arguments', () => {
      logger.info('Just message');
      expect(console.info).toHaveBeenCalledWith('Just message');
    });

    it('should handle many arguments', () => {
      const args = Array.from({ length: 10 }, (_, i) => `arg${i}`);
      logger.info('Many args', ...args);
      expect(console.info).toHaveBeenCalledWith('Many args', ...args);
    });

    it('should handle circular references safely', () => {
      const obj: any = { name: 'test' };
      obj.self = obj; // Create circular reference

      // Should not throw an error
      expect(() => {
        logger.info('Circular reference test', obj);
      }).not.toThrow();

      expect(console.info).toHaveBeenCalledWith('Circular reference test', obj);
    });
  });

  describe('Type Safety Tests', () => {
    it('should accept string messages', () => {
      expect(() => logger.info('string message')).not.toThrow();
    });

    it('should accept various argument types', () => {
      expect(() => {
        logger.info(
          'Mixed types',
          123,
          true,
          null,
          undefined,
          [],
          {},
          new Date(),
        );
      }).not.toThrow();
    });
  });
});
