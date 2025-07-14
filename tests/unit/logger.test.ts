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
    it('should respect log level settings', () => {
      logger.updateConfig({ logLevel: 'warn' });

      logger.debug('Debug message');
      logger.log('Log message');
      logger.info('Info message');
      expect(console.log).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();

      logger.warn('Warning message');
      logger.error('Error message');
      expect(console.warn).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Configuration', () => {
    it('should update configuration', () => {
      logger.updateConfig({
        showTimestamp: false,
        showFileName: false,
      });

      logger.log('Test message');
      expect(console.log).toHaveBeenCalled();
    });
  });
});
