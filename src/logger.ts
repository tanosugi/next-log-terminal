'use client';

import { getLoggerConfig } from './config';
import type { LoggerConfig, LogLevel } from './types';

function extractCallerInfo(): {
  fileName?: string;
  lineNumber?: number;
  columnNumber?: number;
  fullPath?: string;
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

  // Try multiple patterns for file path extraction
  let match = callerLine.match(/at\s+[^(\s]+\s+\((.+?):(\d+):(\d+)\)/);
  if (!match) {
    match = callerLine.match(/at\s+.+?\s+\((.+?):(\d+):(\d+)\)/);
  }
  if (!match) {
    match = callerLine.match(/at\s+(.+?):(\d+):(\d+)/);
  }

  if (match) {
    let filePath = '';
    let lineNumber = '';
    let columnNumber = '';

    if (match.length === 4) {
      [, filePath, lineNumber, columnNumber] = match;
    }

    let fileName = filePath;
    let fullPath = filePath;

    if (filePath.includes('webpack-internal:')) {
      const appMatch = filePath.match(/\/\.\/(app\/.+)$/);
      if (appMatch) {
        fileName = appMatch[1];
        fullPath = appMatch[1];
      }
    } else if (filePath.includes('http://') || filePath.includes('https://')) {
      const urlMatch = filePath.match(/\/([^/]+)$/);
      fileName = urlMatch ? urlMatch[1] : filePath;
    } else {
      // Clean up file path for display
      fileName = shortenFilePath(filePath);
    }

    return {
      fileName,
      lineNumber: parseInt(lineNumber, 10),
      columnNumber: parseInt(columnNumber, 10),
      fullPath,
    };
  }

  return {};
}

function shortenFilePath(filePath: string): string {
  // Remove common prefixes and show relative path
  const cleanPath = filePath
    .replace(/^.*\/node_modules\//, '')
    .replace(/^.*\/\.next\//, '')
    .replace(/^.*\/src\//, 'src/')
    .replace(/^.*\/app\//, 'app/')
    .replace(/^.*\/pages\//, 'pages/')
    .replace(/^.*\/components\//, 'components/')
    .replace(/^.*\/lib\//, 'lib/')
    .replace(/^.*\/utils\//, 'utils/');

  // If still too long, show just the filename
  if (cleanPath.length > 50) {
    const parts = cleanPath.split('/');
    return parts[parts.length - 1];
  }

  return cleanPath;
}

const isServer = typeof window === 'undefined';

function sanitizeArgs(args: any[]): any[] {
  return args.map((arg) => {
    if (typeof arg === 'function') {
      return `[Function: ${arg.name || 'anonymous'}]`;
    }
    if (arg && typeof arg === 'object') {
      try {
        // Check if it's a function-like object by looking for common function properties
        if (
          typeof arg.toString === 'function' &&
          typeof arg.valueOf === 'function' &&
          typeof arg.call === 'function' &&
          typeof arg.apply === 'function'
        ) {
          return `[Function: ${arg.name || 'anonymous'}]`;
        }
      } catch (_e) {
        // If there's an error accessing properties, it's likely a complex object
      }
    }
    return arg;
  });
}

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

      const sanitizedArgs = sanitizeArgs(args);

      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level,
          message,
          args: sanitizedArgs,
          metadata,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to send log to server:', error);
      const sanitizedArgs = sanitizeArgs(args);
      console[level](message, ...sanitizedArgs);
    }
  }

  private formatServerLog(level: string, message: string, args: any[]): void {
    if (!this.shouldLog(level as keyof typeof logLevels)) return;

    const sanitizedArgs = sanitizeArgs(args);
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

    const metaString = metaParts.join(' ');

    const consoleMethod = console[level as keyof Console] as (
      ...args: any[]
    ) => void;

    consoleMethod(
      `${metaColor}${metaString}${resetColor}`,
      `\n${levelColor}→${resetColor}`,
      message,
      ...sanitizedArgs,
      '\n',
    );
  }

  private formatBrowserLog(level: string, message: string, args: any[]): void {
    if (!this.shouldLog(level as keyof typeof logLevels)) return;

    const sanitizedArgs = sanitizeArgs(args);
    const callerInfo = extractCallerInfo();
    const timestamp = this.getTimestamp();

    const colors = {
      log: '#6b7280',
      info: '#3b82f6',
      warn: '#f59e0b',
      error: '#ef4444',
    };

    const levelColor = this.config.useColors
      ? colors[level as keyof typeof colors] || colors.log
      : '#6b7280';

    const metaParts = [];

    if (this.config.showTimestamp) {
      metaParts.push(`[${timestamp}]`);
    }

    metaParts.push(`[CLIENT/${level.toUpperCase()}]`);

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

    const metaString = metaParts.join(' ');

    const consoleMethod = console[level as keyof Console] as (
      ...args: any[]
    ) => void;

    if (this.config.useColors) {
      consoleMethod(
        `%c${metaString}%c → ${message}`,
        `color: #9ca3af; font-weight: bold;`,
        `color: ${levelColor}; font-weight: normal;`,
        ...sanitizedArgs,
      );
    } else {
      consoleMethod(`${metaString} → ${message}`, ...sanitizedArgs);
    }
  }

  log(message: string, ...args: any[]) {
    if (isServer) {
      this.formatServerLog('log', message, args);
    } else {
      if (this.shouldLog('log')) {
        if (this.config.showDetailInBrowser) {
          this.formatBrowserLog('log', message, args);
        } else {
          const sanitizedArgs = sanitizeArgs(args);
          console.log(message, ...sanitizedArgs);
        }
        this.logToServer('log', message, args);
      }
    }
  }

  info(message: string, ...args: any[]) {
    if (isServer) {
      this.formatServerLog('info', message, args);
    } else {
      if (this.shouldLog('info')) {
        if (this.config.showDetailInBrowser) {
          this.formatBrowserLog('info', message, args);
        } else {
          const sanitizedArgs = sanitizeArgs(args);
          console.info(message, ...sanitizedArgs);
        }
        this.logToServer('info', message, args);
      }
    }
  }

  warn(message: string, ...args: any[]) {
    if (isServer) {
      this.formatServerLog('warn', message, args);
    } else {
      if (this.shouldLog('warn')) {
        if (this.config.showDetailInBrowser) {
          this.formatBrowserLog('warn', message, args);
        } else {
          const sanitizedArgs = sanitizeArgs(args);
          console.warn(message, ...sanitizedArgs);
        }
        this.logToServer('warn', message, args);
      }
    }
  }

  error(message: string, ...args: any[]) {
    if (isServer) {
      this.formatServerLog('error', message, args);
    } else {
      if (this.shouldLog('error')) {
        if (this.config.showDetailInBrowser) {
          this.formatBrowserLog('error', message, args);
        } else {
          const sanitizedArgs = sanitizeArgs(args);
          console.error(message, ...sanitizedArgs);
        }
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
        if (this.config.showDetailInBrowser) {
          this.formatBrowserLog('log', `[DEBUG] ${message}`, args);
        } else {
          const sanitizedArgs = sanitizeArgs(args);
          console.log(
            `%c[DEBUG]%c ${message}`,
            'color: #6b7280; font-weight: bold;',
            'color: inherit;',
            ...sanitizedArgs,
          );
        }
        this.logToServer('log', debugMessage, args);
      }
    }
  }
}
