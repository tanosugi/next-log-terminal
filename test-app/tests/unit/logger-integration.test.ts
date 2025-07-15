import { logger } from 'next-log-terminal';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Logger Integration Tests', () => {
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

  describe('Basic logging functionality', () => {
    it('should log info messages', () => {
      logger.info('Integration test info message');
      expect(console.info).toHaveBeenCalledWith(
        'Integration test info message',
      );
    });

    it('should not log debug messages with default config', () => {
      // Debug messages should not log with default 'log' level
      logger.debug('Integration test debug message', { data: 'test' });
      expect(console.log).not.toHaveBeenCalledWith(
        '%c[DEBUG]%c Integration test debug message',
        'color: #6b7280; font-weight: bold;',
        'color: inherit;',
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

  describe('Default behavior', () => {
    it('should log with default configuration', () => {
      // With default configuration, info messages should log
      logger.info('This should log with default config');
      expect(console.info).toHaveBeenCalledWith(
        'This should log with default config',
      );

      // Should log warnings
      logger.warn('This should also log');
      expect(console.warn).toHaveBeenCalledWith('This should also log');
    });

    it('should handle log levels according to default settings', () => {
      // Clear previous mocks
      vi.clearAllMocks();

      logger.debug('Debug message'); // Should not log (level is 'log')
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');

      // Debug should not log with default 'log' level
      expect(console.log).not.toHaveBeenCalledWith(
        '%c[DEBUG]%c Debug message',
        'color: #6b7280; font-weight: bold;',
        'color: inherit;',
      );
      expect(console.info).toHaveBeenCalledWith('Info message');
      expect(console.warn).toHaveBeenCalledWith('Warning message');
      expect(console.error).toHaveBeenCalledWith('Error message');
    });
  });

  describe('Advanced features', () => {
    it('should handle complex data objects', async () => {
      const complexData = {
        user: { id: 123, name: 'Test User' },
        settings: { theme: 'dark', notifications: true },
        metadata: { timestamp: Date.now(), version: '1.0.0' },
      };

      logger.info('Complex data logging', complexData);
      // Wait for any async operations to complete
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(console.info).toHaveBeenCalledWith(
        'Complex data logging',
        complexData,
      );
    });

    it('should handle array data with log level', () => {
      const arrayData = [1, 2, 3, { id: 4, name: 'test' }];
      // Use log() instead of debug() since debug won't show with default config
      logger.log('Array data logging', arrayData);
      expect(console.log).toHaveBeenCalledWith('Array data logging', arrayData);
    });

    it('should handle multiple arguments', async () => {
      logger.info('Multiple args', 'arg1', 'arg2', { data: 'test' }, [1, 2, 3]);
      // Wait for any async operations to complete
      await new Promise((resolve) => setTimeout(resolve, 0));
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
