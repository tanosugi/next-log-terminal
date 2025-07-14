import type { LoggerConfig } from './types';

const defaultConfig: LoggerConfig = {
  showTimestamp: true,
  showFileName: true,
  showLineNumber: true,
  showFunctionName: false,
  useColors: true,
  logLevel: 'log',
};

export function getLoggerConfig(): LoggerConfig {
  const envConfig: Partial<LoggerConfig> = {
    showTimestamp: process.env.NEXT_PUBLIC_LOG_TIMESTAMP !== 'false',
    showFileName: process.env.NEXT_PUBLIC_LOG_FILENAME !== 'false',
    showLineNumber: process.env.NEXT_PUBLIC_LOG_LINENUMBER !== 'false',
    showFunctionName: process.env.NEXT_PUBLIC_LOG_FUNCTION === 'true',
    useColors: process.env.NEXT_PUBLIC_LOG_COLORS !== 'false',
    logLevel:
      (process.env.NEXT_PUBLIC_LOG_LEVEL as LoggerConfig['logLevel']) ||
      defaultConfig.logLevel,
  };

  const buildTimeConfig = (globalThis as any).__NEXT_LOGGER_CONFIG__ || {};

  return {
    ...defaultConfig,
    ...buildTimeConfig,
    ...Object.fromEntries(
      Object.entries(envConfig).filter(([_, v]) => v !== undefined),
    ),
  };
}
