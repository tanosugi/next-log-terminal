export interface LoggerConfig {
  showTimestamp: boolean;
  showFileName: boolean;
  showLineNumber: boolean;
  useColors: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'log' | 'debug';
  apiEndpoint: string;
  showDetailInBrowser: boolean;
  enableFileClick: boolean;
}

export interface LogMetadata {
  timestamp: string;
  fileName?: string;
  lineNumber?: number;
  columnNumber?: number;
  pathname?: string;
  userAgent?: string;
}

export type LogLevel = 'log' | 'info' | 'warn' | 'error';
