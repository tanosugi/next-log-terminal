'use server';

import { getLoggerConfig } from './config';
import type { LogLevel, LogMetadata } from './types';

export async function serverLog(
  level: LogLevel,
  message: string,
  args: any[],
  metadata: LogMetadata,
) {
  const config = getLoggerConfig();
  
  // Try to get headers safely, fallback to 'Unknown' if not available
  let userAgent = 'Unknown';
  try {
    const { headers } = await import('next/headers');
    const headersList = headers();
    userAgent = headersList.get('user-agent') || 'Unknown';
  } catch (error) {
    // Headers not available (likely called outside request context)
    userAgent = 'Unknown';
  }

  const colors = {
    log: '\x1b[37m',
    info: '\x1b[36m',
    warn: '\x1b[33m',
    error: '\x1b[31m',
    meta: '\x1b[90m',
  };

  const reset = '\x1b[0m';
  const gray = '\x1b[90m';

  const levelColor = config.useColors ? colors[level] : '';
  const metaColor = config.useColors ? gray : '';
  const resetColor = config.useColors ? reset : '';

  const metaParts = [];

  if (config.showTimestamp) {
    metaParts.push(`[${metadata.timestamp}]`);
  }

  metaParts.push(`[CLIENT/${level.toUpperCase()}]`);

  if (config.showFileName && metadata.fileName) {
    let filePart = metadata.fileName;
    if (config.showLineNumber && metadata.lineNumber) {
      filePart += `:${metadata.lineNumber}`;
      if (metadata.columnNumber) {
        filePart += `:${metadata.columnNumber}`;
      }
    }
    metaParts.push(filePart);
  }

  if (config.showFunctionName && metadata.functionName) {
    metaParts.push(`in ${metadata.functionName}()`);
  }

  const metaString = metaParts.join(' ');
  console[level](
    `${metaColor}${metaString}${resetColor}`,
    `\n${levelColor}→${resetColor}`,
    message,
    ...args,
  );
}
