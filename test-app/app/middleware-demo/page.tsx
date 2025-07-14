import { logger } from 'next-log-terminal';

export default function MiddlewareDemoPage() {
  logger.info('Middleware demo page rendered');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Middleware Demo</h1>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 mb-4">
            This page demonstrates middleware logging. Check your terminal to
            see the middleware logs when you navigate to this page.
          </p>

          <div className="space-y-2 text-sm">
            <p>• Navigate between pages to see middleware logs</p>
            <p>• Each page navigation triggers middleware execution</p>
            <p>• Logs include request path, method, and user agent</p>
          </div>
        </div>

        <div className="mt-6">
          <a
            href="/"
            className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
