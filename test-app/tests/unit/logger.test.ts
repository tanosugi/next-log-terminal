import { logger } from 'next-log-terminal';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Logger in test-app', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should log messages', () => {
    logger.log('Test message from test-app');
    expect(console.log).toHaveBeenCalledWith('Test message from test-app');
  });

  it('should log info messages', () => {
    logger.info('Info message from test-app');
    expect(console.info).toHaveBeenCalledWith('Info message from test-app');
  });

  it('should log warning messages', () => {
    logger.warn('Warning message from test-app');
    expect(console.warn).toHaveBeenCalledWith('Warning message from test-app');
  });

  it('should log error messages', () => {
    logger.error('Error message from test-app');
    expect(console.error).toHaveBeenCalledWith('Error message from test-app');
  });

  it('should handle configuration updates', () => {
    logger.updateConfig({ showTimestamp: false });
    logger.log('Test message without timestamp');
    expect(console.log).toHaveBeenCalledWith('Test message without timestamp');
  });
});
