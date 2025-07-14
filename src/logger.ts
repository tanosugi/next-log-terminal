'use client';

import { getLoggerConfig } from './config';
import type { LoggerConfig, LogLevel } from './types';

function extractCallerInfo(): {
  fileName?: string;
  lineNumber?: number;
  columnNumber?: number;
  functionName?: string;
} {
  const error = new Error();
  const stack = error.stack || '';
  const lines = stack.split('\n');

  let callerLine = lines[4] || lines[3] || '';

  for (let i = 3; i < lines.length; i++) {
    if (
      !lines[i].includes('webpack-internal:') &&
      !lines[i].includes('unified-logger') &&
      !lines[i].includes('node_modules')
    ) {
      callerLine = lines[i];
      break;
    }
  }

  const match = callerLine.match(/at\s+(?:(.+?)\s+\()?(.+?):(\d+):(\d+)\)?/);

  if (match) {
    const [, functionName, filePath, lineNumber, columnNumber] = match;

    let fileName = filePath;
    if (filePath.includes('webpack-internal:')) {
      const appMatch = filePath.match(/\/\.\/(app\/.+)$/);
      if (appMatch) {
        fileName = appMatch[1];
      }
    } else if (filePath.includes('http://') || filePath.includes('https://')) {
      const urlMatch = filePath.match(/\/([^/]+)$/);
      fileName = urlMatch ? urlMatch[1] : filePath;
    }

    return {
      fileName,
      lineNumber: parseInt(lineNumber, 10),
      columnNumber: parseInt(columnNumber, 10),
      functionName: functionName || 'anonymous',
    };
  }

  return {};
}

const isServer = typeof window === 'undefined';

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  log: 3,
  debug: 4,
};

export class UnifiedLogger {
  private config: LoggerConfig;

  constructor() {
    this.config = getLoggerConfig();
  }

  updateConfig(newConfig: Partial<LoggerConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  private shouldLog(level: keyof typeof logLevels): boolean {
    return logLevels[level] <= logLevels[this.config.logLevel];
  }

  private getTimestamp(): string {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const ms = now.getMilliseconds().toString().padStart(3, '0');
    return `${hours}:${minutes}:${seconds}.${ms}`;
  }

  private async logToServer(level: LogLevel, message: string, args: any[]) {
    if (!this.shouldLog(level)) return;

    try {
      const callerInfo = extractCallerInfo();
      const metadata = {
        timestamp: this.getTimestamp(),
        ...callerInfo,
        pathname:
          typeof window !== 'undefined' ? window.location.pathname : undefined,
      };

      // Dynamic import to avoid loading Next.js dependencies at initialization
      const { serverLog } = await import('./server-action');
      await serverLog(level, message, args, metadata);
    } catch (error) {
      console.error('Failed to send log to server:', error);
      console[level](message, ...args);
    }
  }

  private formatServerLog(level: string, message: string, args: any[]): void {
    if (!this.shouldLog(level as keyof typeof logLevels)) return;

    const callerInfo = extractCallerInfo();
    const timestamp = this.getTimestamp();

    const colors = {
      log: '\x1b[37m',
      info: '\x1b[36m',
      warn: '\x1b[33m',
      error: '\x1b[31m',
    };

    const reset = '\x1b[0m';
    const gray = '\x1b[90m';

    const levelColor = this.config.useColors
      ? colors[level as keyof typeof colors] || colors.log
      : '';
    const metaColor = this.config.useColors ? gray : '';
    const resetColor = this.config.useColors ? reset : '';

    const metaParts = [];

    if (this.config.showTimestamp) {
      metaParts.push(`[${timestamp}]`);
    }

    metaParts.push(`[SERVER/${level.toUpperCase()}]`);

    if (this.config.showFileName && callerInfo.fileName) {
      let filePart = callerInfo.fileName;
      if (this.config.showLineNumber && callerInfo.lineNumber) {
        filePart += `:${callerInfo.lineNumber}`;
        if (callerInfo.columnNumber) {
          filePart += `:${callerInfo.columnNumber}`;
        }
      }
      metaParts.push(filePart);
    }

    if (this.config.showFunctionName && callerInfo.functionName) {
      metaParts.push(`in ${callerInfo.functionName}()`);
    }

    const metaString = metaParts.join(' ');

    const consoleMethod = console[level as keyof Console] as (
      ...args: any[]
    ) => void;
    consoleMethod(
      `${metaColor}${metaString}${resetColor}`,
      `\n${levelColor}→${resetColor}`,
      message,
      ...args,
      '\n',
    );
  }

  log(message: string, ...args: any[]) {
    if (isServer) {
      this.formatServerLog('log', message, args);
    } else {
      if (this.shouldLog('log')) {
        console.log(message, ...args);
        this.logToServer('log', message, args);
      }
    }
  }

  info(message: string, ...args: any[]) {
    if (isServer) {
      this.formatServerLog('info', message, args);
    } else {
      if (this.shouldLog('info')) {
        console.info(message, ...args);
        this.logToServer('info', message, args);
      }
    }
  }

  warn(message: string, ...args: any[]) {
    if (isServer) {
      this.formatServerLog('warn', message, args);
    } else {
      if (this.shouldLog('warn')) {
        console.warn(message, ...args);
        this.logToServer('warn', message, args);
      }
    }
  }

  error(message: string, ...args: any[]) {
    if (isServer) {
      this.formatServerLog('error', message, args);
    } else {
      if (this.shouldLog('error')) {
        console.error(message, ...args);
        this.logToServer('error', message, args);
      }
    }
  }

  debug(message: string, ...args: any[]) {
    if (this.shouldLog('debug')) {
      const debugMessage = `[DEBUG] ${message}`;

      if (isServer) {
        this.formatServerLog('log', debugMessage, args);
      } else {
        console.log(
          `%c[DEBUG]%c ${message}`,
          'color: #6b7280; font-weight: bold;',
          'color: inherit;',
          ...args,
        );
        this.logToServer('log', debugMessage, args);
      }
    }
  }
}
