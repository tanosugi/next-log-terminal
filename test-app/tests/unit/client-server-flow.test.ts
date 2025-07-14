import { logger } from 'next-log-terminal';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock server action
const mockServerLog = vi.fn().mockResolvedValue(undefined);
vi.mock('next-log-terminal/server', () => ({
  serverLog: mockServerLog,
}));

// Mock window for client-side testing
Object.defineProperty(window, 'location', {
  value: {
    pathname: '/test-page',
  },
  writable: true,
});

describe('Client-Server Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Client-side Logging Flow', () => {
    it('should log to console and attempt server log', async () => {
      logger.info('Client test message');

      // Should log to console immediately
      expect(console.info).toHaveBeenCalledWith('Client test message');

      // Should also attempt to send to server
      // Wait for any pending promises
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockServerLog).toHaveBeenCalledWith(
        'info',
        'Client test message',
        [],
        expect.objectContaining({
          timestamp: expect.any(String),
          pathname: '/test-page',
        }),
      );
    });

    it('should include caller information in server logs', async () => {
      logger.warn('Warning with caller info', { data: 'test' });

      expect(console.warn).toHaveBeenCalledWith('Warning with caller info', {
        data: 'test',
      });

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockServerLog).toHaveBeenCalledWith(
        'warn',
        'Warning with caller info',
        [{ data: 'test' }],
        expect.objectContaining({
          timestamp: expect.any(String),
          pathname: '/test-page',
          fileName: expect.any(String),
          lineNumber: expect.any(Number),
        }),
      );
    });

    it('should handle server log failures gracefully', async () => {
      // Make server log fail
      mockServerLog.mockRejectedValueOnce(new Error('Server error'));

      logger.error('Error message');

      // Should still log to console
      expect(console.error).toHaveBeenCalledWith('Error message');

      await new Promise((resolve) => setTimeout(resolve, 0));

      // Should have attempted server log
      expect(mockServerLog).toHaveBeenCalled();

      // Should not throw error
      expect(() => {
        logger.info('After error');
      }).not.toThrow();
    });
  });

  describe('Log Level Filtering', () => {
    it('should not send filtered logs to server', async () => {
      logger.updateConfig({ logLevel: 'error' });

      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warn message');

      // Should not log to console
      expect(console.log).not.toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG]'),
        'Debug message',
      );
      expect(console.info).not.toHaveBeenCalledWith('Info message');
      expect(console.warn).not.toHaveBeenCalledWith('Warn message');

      await new Promise((resolve) => setTimeout(resolve, 0));

      // Should not send to server either
      expect(mockServerLog).not.toHaveBeenCalled();

      // But error should work
      logger.error('Error message');
      expect(console.error).toHaveBeenCalledWith('Error message');

      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(mockServerLog).toHaveBeenCalledWith(
        'error',
        'Error message',
        [],
        expect.any(Object),
      );
    });
  });

  describe('Metadata Extraction Tests', () => {
    it('should extract timestamp correctly', async () => {
      const startTime = Date.now();
      logger.info('Timestamp test');

      await new Promise((resolve) => setTimeout(resolve, 0));

      const call = mockServerLog.mock.calls[0];
      const metadata = call[3];

      // Parse timestamp
      const [hours, minutes, seconds] = metadata.timestamp.split(':');
      const [secs, ms] = seconds.split('.');

      expect(Number.parseInt(hours)).toBeGreaterThanOrEqual(0);
      expect(Number.parseInt(hours)).toBeLessThan(24);
      expect(Number.parseInt(minutes)).toBeGreaterThanOrEqual(0);
      expect(Number.parseInt(minutes)).toBeLessThan(60);
      expect(Number.parseInt(secs)).toBeGreaterThanOrEqual(0);
      expect(Number.parseInt(secs)).toBeLessThan(60);
      expect(Number.parseInt(ms)).toBeGreaterThanOrEqual(0);
      expect(Number.parseInt(ms)).toBeLessThan(1000);
    });

    it('should include pathname from window.location', async () => {
      window.location.pathname = '/custom-path';

      logger.info('Path test');

      await new Promise((resolve) => setTimeout(resolve, 0));

      const call = mockServerLog.mock.calls[0];
      const metadata = call[3];

      expect(metadata.pathname).toBe('/custom-path');
    });
  });

  describe('Multiple Arguments Handling', () => {
    it('should handle multiple arguments correctly', async () => {
      const arg1 = 'string';
      const arg2 = { id: 1, name: 'test' };
      const arg3 = [1, 2, 3];
      const arg4 = new Date('2024-01-01');

      logger.info('Multiple args test', arg1, arg2, arg3, arg4);

      expect(console.info).toHaveBeenCalledWith(
        'Multiple args test',
        arg1,
        arg2,
        arg3,
        arg4,
      );

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockServerLog).toHaveBeenCalledWith(
        'info',
        'Multiple args test',
        [arg1, arg2, arg3, arg4],
        expect.any(Object),
      );
    });
  });
});
