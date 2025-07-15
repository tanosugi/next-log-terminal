'use client';

import { logger } from 'next-log-terminal';

export default function DebugBrowserLogging() {
  // Replicate getLoggerConfig logic to avoid import issues
  const config = {
    showTimestamp: process.env.NEXT_PUBLIC_LOG_TIMESTAMP !== 'false',
    showFileName: process.env.NEXT_PUBLIC_LOG_FILENAME !== 'false',
    showLineNumber: process.env.NEXT_PUBLIC_LOG_LINENUMBER !== 'false',
    useColors: process.env.NEXT_PUBLIC_LOG_COLORS !== 'false',
    logLevel: process.env.NEXT_PUBLIC_LOG_LEVEL || 'log',
    apiEndpoint:
      process.env.NEXT_PUBLIC_LOG_API_ENDPOINT || '/api/log-terminal',
    showDetailInBrowser:
      process.env.NEXT_PUBLIC_LOG_DETAIL_IN_BROWSER !== 'false',
  };

  const handleTestLogging = () => {
    // Log the configuration
    console.log('Logger Configuration:', config);

    // Log environment variables
    console.log('Environment Variables:', {
      NEXT_PUBLIC_LOG_TIMESTAMP: process.env.NEXT_PUBLIC_LOG_TIMESTAMP,
      NEXT_PUBLIC_LOG_FILENAME: process.env.NEXT_PUBLIC_LOG_FILENAME,
      NEXT_PUBLIC_LOG_LINENUMBER: process.env.NEXT_PUBLIC_LOG_LINENUMBER,
      NEXT_PUBLIC_LOG_COLORS: process.env.NEXT_PUBLIC_LOG_COLORS,
      NEXT_PUBLIC_LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL,
      NEXT_PUBLIC_LOG_API_ENDPOINT: process.env.NEXT_PUBLIC_LOG_API_ENDPOINT,
      NEXT_PUBLIC_LOG_DETAIL_IN_BROWSER:
        process.env.NEXT_PUBLIC_LOG_DETAIL_IN_BROWSER,
    });

    // Test different log levels
    logger.error('Test error message');
    logger.warn('Test warning message');
    logger.info('Test info message');
    logger.log('Test log message');
    logger.debug('Test debug message');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Browser Logging Debug</h1>

      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-semibold mb-2">Current Configuration:</h2>
        <pre className="text-sm">{JSON.stringify(config, null, 2)}</pre>
      </div>

      <div className="bg-blue-100 p-4 rounded mb-4">
        <h2 className="font-semibold mb-2">Environment Variables:</h2>
        <pre className="text-sm">
          {JSON.stringify(
            {
              NEXT_PUBLIC_LOG_TIMESTAMP: process.env.NEXT_PUBLIC_LOG_TIMESTAMP,
              NEXT_PUBLIC_LOG_FILENAME: process.env.NEXT_PUBLIC_LOG_FILENAME,
              NEXT_PUBLIC_LOG_LINENUMBER:
                process.env.NEXT_PUBLIC_LOG_LINENUMBER,
              NEXT_PUBLIC_LOG_COLORS: process.env.NEXT_PUBLIC_LOG_COLORS,
              NEXT_PUBLIC_LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL,
              NEXT_PUBLIC_LOG_API_ENDPOINT:
                process.env.NEXT_PUBLIC_LOG_API_ENDPOINT,
              NEXT_PUBLIC_LOG_DETAIL_IN_BROWSER:
                process.env.NEXT_PUBLIC_LOG_DETAIL_IN_BROWSER,
            },
            null,
            2,
          )}
        </pre>
      </div>

      <button
        type="button"
        onClick={handleTestLogging}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Test Browser Logging
      </button>

      <div className="mt-4 text-sm text-gray-600">
        <p>Instructions:</p>
        <ol className="list-decimal list-inside">
          <li>Click "Test Browser Logging" button</li>
          <li>Open Browser DevTools Console</li>
          <li>
            Check if logs show detailed format with timestamps and file info
          </li>
          <li>
            Expected format: [HH:MM:SS.mmm] [CLIENT/LEVEL] file.tsx:line:col →
            message
          </li>
        </ol>
      </div>
    </div>
  );
}
