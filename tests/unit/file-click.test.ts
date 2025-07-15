import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getLoggerConfig } from '../../src/config';

// Mock fetch
global.fetch = vi.fn();

describe('File Click Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear environment variables
    delete process.env.NEXT_PUBLIC_LOG_ENABLE_FILE_CLICK;
  });

  it('should have enableFileClick in config by default', () => {
    const config = getLoggerConfig();
    expect(config.enableFileClick).toBe(true);
  });

  it('should disable file click when environment variable is false', () => {
    process.env.NEXT_PUBLIC_LOG_ENABLE_FILE_CLICK = 'false';
    const config = getLoggerConfig();
    expect(config.enableFileClick).toBe(false);
  });

  it('should enable file click when environment variable is true', () => {
    process.env.NEXT_PUBLIC_LOG_ENABLE_FILE_CLICK = 'true';
    const config = getLoggerConfig();
    expect(config.enableFileClick).toBe(true);
  });

  it('should enable file click when environment variable is not set', () => {
    const config = getLoggerConfig();
    expect(config.enableFileClick).toBe(true);
  });
});
