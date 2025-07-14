import { logger, UnifiedLogger } from 'next-log-terminal';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Complete next-log-terminal Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    it('should handle all log levels', () => {
      logger.debug('Debug message');
      logger.log('Log message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG]'),
        'Debug message',
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

  describe('Configuration Tests', () => {
    it('should handle configuration updates', () => {
      const customLogger = new UnifiedLogger();

      customLogger.updateConfig({
        showTimestamp: false,
        showFileName: false,
        logLevel: 'warn',
      });

      // Should not log debug/info when level is warn
      customLogger.debug('Should not appear');
      customLogger.info('Should not appear');
      expect(console.log).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();

      // Should log warn and error
      customLogger.warn('Should appear');
      customLogger.error('Should appear');
      expect(console.warn).toHaveBeenCalledWith('Should appear');
      expect(console.error).toHaveBeenCalledWith('Should appear');
    });

    it('should respect different log levels', () => {
      const testLevels = ['error', 'warn', 'info', 'log', 'debug'] as const;

      for (const level of testLevels) {
        const customLogger = new UnifiedLogger();
        customLogger.updateConfig({ logLevel: level });

        vi.clearAllMocks();

        // Test each method
        customLogger.error('error');
        customLogger.warn('warn');
        customLogger.info('info');
        customLogger.log('log');
        customLogger.debug('debug');

        // Check expected behavior based on level
        switch (level) {
          case 'error':
            expect(console.error).toHaveBeenCalled();
            expect(console.warn).not.toHaveBeenCalled();
            expect(console.info).not.toHaveBeenCalled();
            expect(console.log).not.toHaveBeenCalledWith('log');
            break;
          case 'warn':
            expect(console.error).toHaveBeenCalled();
            expect(console.warn).toHaveBeenCalled();
            expect(console.info).not.toHaveBeenCalled();
            expect(console.log).not.toHaveBeenCalledWith('log');
            break;
          case 'info':
            expect(console.error).toHaveBeenCalled();
            expect(console.warn).toHaveBeenCalled();
            expect(console.info).toHaveBeenCalled();
            expect(console.log).not.toHaveBeenCalledWith('log');
            break;
          case 'log':
            expect(console.error).toHaveBeenCalled();
            expect(console.warn).toHaveBeenCalled();
            expect(console.info).toHaveBeenCalled();
            expect(console.log).toHaveBeenCalledWith('log');
            break;
          case 'debug':
            expect(console.error).toHaveBeenCalled();
            expect(console.warn).toHaveBeenCalled();
            expect(console.info).toHaveBeenCalled();
            expect(console.log).toHaveBeenCalledWith('log');
            expect(console.log).toHaveBeenCalledWith(
              expect.stringContaining('[DEBUG]'),
              'debug',
            );
            break;
        }
      }
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
