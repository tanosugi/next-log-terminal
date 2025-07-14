export interface LoggerConfig {
  showTimestamp: boolean;
  showFileName: boolean;
  showLineNumber: boolean;
  showFunctionName: boolean;
  useColors: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'log' | 'debug';
  apiEndpoint: string;
}

export interface LogMetadata {
  timestamp: string;
  fileName?: string;
  lineNumber?: number;
  columnNumber?: number;
  functionName?: string;
  pathname?: string;
  userAgent?: string;
}

export type LogLevel = 'log' | 'info' | 'warn' | 'error';
