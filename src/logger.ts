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

function getAbsolutePath(relativePath: string): string {
  if (typeof process !== 'undefined' && process.cwd) {
    const path = require('node:path');
    return path.resolve(process.cwd(), relativePath);
  }
  return relativePath;
}

function getEditorProtocolUrl(
  editor: string,
  filePath: string,
  lineNumber: number,
): string {
  const absolutePath = getAbsolutePath(filePath);

  switch (editor.toLowerCase()) {
    case 'code':
    case 'vscode':
      return `vscode://file/${absolutePath}:${lineNumber}`;
    case 'cursor':
      return `cursor://file/${absolutePath}:${lineNumber}`;
    case 'webstorm':
    case 'idea':
      return `webstorm://open?file=${absolutePath}&line=${lineNumber}`;
    case 'sublime':
    case 'subl':
      return `sublime://open?file=${absolutePath}&line=${lineNumber}`;
    case 'atom':
      return `atom://open?file=${absolutePath}&line=${lineNumber}`;
    default:
      return `vscode://file/${absolutePath}:${lineNumber}`;
  }
}

// Removed createClickableFile function - browser file clicking is no longer supported

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

      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level,
          message,
          args,
          metadata,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
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

    const metaString = metaParts.join(' ');

    const consoleMethod = console[level as keyof Console] as (
      ...args: any[]
    ) => void;

    // Add clickable editor protocol link if enabled
    let editorLink = '';
    if (
      this.config.enableFileClick &&
      callerInfo.fullPath &&
      callerInfo.lineNumber
    ) {
      const reactEditor = process.env.REACT_EDITOR || 'code';
      const protocolUrl = getEditorProtocolUrl(
        reactEditor,
        callerInfo.fullPath,
        callerInfo.lineNumber,
      );
      editorLink = `\n${metaColor}📁 ${protocolUrl}${resetColor}`;
    }

    consoleMethod(
      `${metaColor}${metaString}${resetColor}`,
      `\n${levelColor}→${resetColor}`,
      message,
      ...args,
      editorLink,
      '\n',
    );
  }

  private formatBrowserLog(level: string, message: string, args: any[]): void {
    if (!this.shouldLog(level as keyof typeof logLevels)) return;

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
        ...args,
      );
    } else {
      consoleMethod(`${metaString} → ${message}`, ...args);
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
          console.log(message, ...args);
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
          console.info(message, ...args);
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
          console.warn(message, ...args);
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
          console.error(message, ...args);
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
          console.log(
            `%c[DEBUG]%c ${message}`,
            'color: #6b7280; font-weight: bold;',
            'color: inherit;',
            ...args,
          );
        }
        this.logToServer('log', debugMessage, args);
      }
    }
  }
}
