import type { LoggerConfig } from './types';

const defaultConfig: LoggerConfig = {
  showTimestamp: true,
  showFileName: true,
  showLineNumber: true,
  useColors: true,
  logLevel: 'log',
  apiEndpoint: '/api/log-terminal',
};

export function getLoggerConfig(): LoggerConfig {
  const envConfig: Partial<LoggerConfig> = {
    showTimestamp: process.env.NEXT_PUBLIC_LOG_TIMESTAMP !== 'false',
    showFileName: process.env.NEXT_PUBLIC_LOG_FILENAME !== 'false',
    showLineNumber: process.env.NEXT_PUBLIC_LOG_LINENUMBER !== 'false',
    useColors: process.env.NEXT_PUBLIC_LOG_COLORS !== 'false',
    logLevel:
      (process.env.NEXT_PUBLIC_LOG_LEVEL as LoggerConfig['logLevel']) ||
      defaultConfig.logLevel,
    apiEndpoint:
      process.env.NEXT_PUBLIC_LOG_API_ENDPOINT || defaultConfig.apiEndpoint,
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
