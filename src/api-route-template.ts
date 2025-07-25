import { type NextRequest, NextResponse } from 'next/server';
import { captureLog } from './debug-utils';

interface LogRequest {
  level: 'log' | 'info' | 'warn' | 'error';
  message: string;
  args: any[];
  metadata: {
    timestamp: string;
    fileName?: string;
    lineNumber?: number;
    columnNumber?: number;
    pathname?: string;
    fullPath?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    if (!body.trim()) {
      return NextResponse.json(
        { error: 'Empty request body' },
        { status: 400 },
      );
    }

    const logData: LogRequest = JSON.parse(body);

    // Capture the log for debugging if enabled
    captureLog(logData.level, logData.message, logData.args, logData.metadata);

    const colors = {
      log: '\x1b[37m',
      info: '\x1b[36m',
      warn: '\x1b[33m',
      error: '\x1b[31m',
    };

    const reset = '\x1b[0m';
    const gray = '\x1b[90m';

    const _userAgent = request.headers.get('user-agent') || 'Unknown';
    const config = {
      showTimestamp: process.env.NEXT_PUBLIC_LOG_TIMESTAMP !== 'false',
      showFileName: process.env.NEXT_PUBLIC_LOG_FILENAME !== 'false',
      showLineNumber: process.env.NEXT_PUBLIC_LOG_LINENUMBER !== 'false',
      useColors: process.env.NEXT_PUBLIC_LOG_COLORS !== 'false',
    };

    const levelColor = config.useColors ? colors[logData.level] : '';
    const metaColor = config.useColors ? gray : '';
    const resetColor = config.useColors ? reset : '';

    const metaParts = [];

    if (config.showTimestamp) {
      metaParts.push(`[${logData.metadata.timestamp}]`);
    }

    metaParts.push(`[CLIENT/${logData.level.toUpperCase()}]`);

    if (config.showFileName && logData.metadata.fileName) {
      let filePart = logData.metadata.fileName;
      if (config.showLineNumber && logData.metadata.lineNumber) {
        filePart += `:${logData.metadata.lineNumber}`;
        if (logData.metadata.columnNumber) {
          filePart += `:${logData.metadata.columnNumber}`;
        }
      }
      metaParts.push(filePart);
    }

    const metaString = metaParts.join(' ');

    console[logData.level](
      `${metaColor}${metaString}${resetColor}`,
      `\n${levelColor}→${resetColor}`,
      logData.message,
      ...logData.args,
      '\n',
    );

    // Send to test logs if available (for testing purposes)
    try {
      const testLogEnabled = process.env.NEXT_PUBLIC_TEST_LOG;

      // Debug: Log environment variable value for troubleshooting
      // if (process.env.NODE_ENV === 'development') {
      //   console.log(`[DEBUG] NEXT_PUBLIC_TEST_LOG value: "${testLogEnabled}"`);
      // }

      if (testLogEnabled === "true") {
        const testLogsUrl = new URL('/api/test-logs', request.url);
        await fetch(testLogsUrl.toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'add',
            logData: {
              level: logData.level,
              message: logData.message,
              args: logData.args,
              metadata: logData.metadata,
            },
          }),
        });

        // if (process.env.NODE_ENV === 'development') {
        //   console.log('[DEBUG] Test log sent to /api/test-logs');
        // }
      }
    } catch (_error) {
      // Ignore test logs errors in production
      // if (process.env.NODE_ENV === 'development') {
      //   console.log('[DEBUG] Test log sending failed:', _error);
      // }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to process log request:', error);
    return NextResponse.json(
      { error: 'Failed to process log' },
      { status: 500 },
    );
  }
}
