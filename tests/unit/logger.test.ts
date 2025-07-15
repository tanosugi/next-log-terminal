import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UnifiedLogger } from '../../src/logger';

describe('UnifiedLogger', () => {
  let logger: UnifiedLogger;

  beforeEach(() => {
    logger = new UnifiedLogger();
    vi.clearAllMocks();
  });

  describe('Basic logging', () => {
    it('should log messages', () => {
      logger.log('Test message');
      expect(console.log).toHaveBeenCalled();
    });

    it('should log info messages', () => {
      logger.info('Info message');
      expect(console.info).toHaveBeenCalled();
    });

    it('should log warning messages', () => {
      logger.warn('Warning message');
      expect(console.warn).toHaveBeenCalled();
    });

    it('should log error messages', () => {
      logger.error('Error message');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Log levels', () => {
    it('should log with default configuration', () => {
      logger.debug('Debug message');
      logger.log('Log message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');

      // With default configuration, all logging methods should work
      expect(console.log).toHaveBeenCalled();
      expect(console.info).toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });
  });
});
