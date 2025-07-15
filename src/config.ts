import type { LoggerConfig } from './types';

export function getLoggerConfig(): LoggerConfig {
  return {
    showTimestamp: process.env.NEXT_PUBLIC_LOG_TIMESTAMP !== 'false',
    showFileName: process.env.NEXT_PUBLIC_LOG_FILENAME !== 'false',
    showLineNumber: process.env.NEXT_PUBLIC_LOG_LINENUMBER !== 'false',
    useColors: process.env.NEXT_PUBLIC_LOG_COLORS !== 'false',
    logLevel:
      (process.env.NEXT_PUBLIC_LOG_LEVEL as LoggerConfig['logLevel']) || 'log',
    apiEndpoint:
      process.env.NEXT_PUBLIC_LOG_API_ENDPOINT || '/api/log-terminal',
    showDetailInBrowser:
      process.env.NEXT_PUBLIC_LOG_DETAIL_IN_BROWSER !== 'false',
    enableFileClick: process.env.NEXT_PUBLIC_LOG_ENABLE_FILE_CLICK !== 'false',
  };
}
