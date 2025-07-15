'use client';

export default function EnvironmentVariables() {
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

  const envVars = {
    NEXT_PUBLIC_LOG_TIMESTAMP: process.env.NEXT_PUBLIC_LOG_TIMESTAMP,
    NEXT_PUBLIC_LOG_FILENAME: process.env.NEXT_PUBLIC_LOG_FILENAME,
    NEXT_PUBLIC_LOG_LINENUMBER: process.env.NEXT_PUBLIC_LOG_LINENUMBER,
    NEXT_PUBLIC_LOG_COLORS: process.env.NEXT_PUBLIC_LOG_COLORS,
    NEXT_PUBLIC_LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL,
    NEXT_PUBLIC_LOG_API_ENDPOINT: process.env.NEXT_PUBLIC_LOG_API_ENDPOINT,
    NEXT_PUBLIC_LOG_DETAIL_IN_BROWSER:
      process.env.NEXT_PUBLIC_LOG_DETAIL_IN_BROWSER,
  };

  return (
    <div className="mt-8 bg-blue-50 p-6 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">
        Environment Variables Status
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium mb-2">Raw Environment Variables:</h3>
          <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
            {JSON.stringify(envVars, null, 2)}
          </pre>
        </div>

        <div>
          <h3 className="font-medium mb-2">Parsed Logger Configuration:</h3>
          <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>
      </div>

      <div className="mt-4 p-4 bg-white rounded border">
        <h3 className="font-medium mb-2">Status:</h3>
        <div className="space-y-1 text-sm">
          <div
            className={`flex items-center space-x-2 ${config.showDetailInBrowser ? 'text-green-600' : 'text-red-600'}`}
          >
            <span>{config.showDetailInBrowser ? '✅' : '❌'}</span>
            <span>
              Detail in Browser:{' '}
              {config.showDetailInBrowser ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div
            className={`flex items-center space-x-2 ${config.showTimestamp ? 'text-green-600' : 'text-orange-600'}`}
          >
            <span>{config.showTimestamp ? '✅' : '⚠️'}</span>
            <span>
              Timestamp: {config.showTimestamp ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div
            className={`flex items-center space-x-2 ${config.showFileName ? 'text-green-600' : 'text-orange-600'}`}
          >
            <span>{config.showFileName ? '✅' : '⚠️'}</span>
            <span>
              File Name: {config.showFileName ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div
            className={`flex items-center space-x-2 ${config.logLevel === 'debug' ? 'text-green-600' : 'text-blue-600'}`}
          >
            <span>🔍</span>
            <span>Log Level: {config.logLevel}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-yellow-50 rounded border border-yellow-200">
        <h3 className="font-medium mb-2 text-yellow-800">
          Expected from next.config.js:
        </h3>
        <div className="text-sm text-yellow-700">
          <p>• All environment variables should be defined (not undefined)</p>
          <p>• showDetailInBrowser should be true</p>
          <p>• logLevel should be 'debug'</p>
          <p>• If values are undefined, Next.js app may need restart</p>
        </div>
      </div>
    </div>
  );
}
