import { logger } from 'next-log-terminal';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Logger Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic logging functionality', () => {
    it('should log info messages', () => {
      logger.info('Integration test info message');
      expect(console.info).toHaveBeenCalledWith(
        'Integration test info message',
      );
    });

    it('should log debug messages', () => {
      logger.debug('Integration test debug message', { data: 'test' });
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG]'),
        'Integration test debug message',
        { data: 'test' },
      );
    });

    it('should log warning messages', () => {
      logger.warn('Integration test warning message');
      expect(console.warn).toHaveBeenCalledWith(
        'Integration test warning message',
      );
    });

    it('should log error messages', () => {
      const testError = new Error('Test error');
      logger.error('Integration test error message', testError);
      expect(console.error).toHaveBeenCalledWith(
        'Integration test error message',
        testError,
      );
    });
  });

  describe('Configuration', () => {
    it('should allow configuration updates', () => {
      logger.updateConfig({ showTimestamp: false, logLevel: 'warn' });

      // Should not log info when level is warn
      logger.info('This should not log');
      expect(console.info).not.toHaveBeenCalled();

      // Should log warnings
      logger.warn('This should log');
      expect(console.warn).toHaveBeenCalledWith('This should log');
    });

    it('should respect log levels', () => {
      logger.updateConfig({ logLevel: 'error' });

      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      expect(console.log).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();

      logger.error('Error message');
      expect(console.error).toHaveBeenCalledWith('Error message');
    });
  });

  describe('Advanced features', () => {
    it('should handle complex data objects', () => {
      const complexData = {
        user: { id: 123, name: 'Test User' },
        settings: { theme: 'dark', notifications: true },
        metadata: { timestamp: Date.now(), version: '1.0.0' },
      };

      logger.info('Complex data logging', complexData);
      expect(console.info).toHaveBeenCalledWith(
        'Complex data logging',
        complexData,
      );
    });

    it('should handle array data', () => {
      const arrayData = [1, 2, 3, { id: 4, name: 'test' }];
      logger.debug('Array data logging', arrayData);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG]'),
        'Array data logging',
        arrayData,
      );
    });

    it('should handle multiple arguments', () => {
      logger.info('Multiple args', 'arg1', 'arg2', { data: 'test' }, [1, 2, 3]);
      expect(console.info).toHaveBeenCalledWith(
        'Multiple args',
        'arg1',
        'arg2',
        { data: 'test' },
        [1, 2, 3],
      );
    });
  });
});
