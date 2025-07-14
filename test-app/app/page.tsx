import { logger } from 'next-log-terminal';
import Button from './components/Button';
import ErrorBoundary from './components/ErrorBoundary';
import UserList from './components/UserList';

export default async function Home() {
  logger.info('Home page server component rendered');
  logger.debug('Starting page load', { timestamp: Date.now() });

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          next-log-terminal Demo
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Client Logging</h2>
            <p className="text-gray-600 mb-4">
              Click the button to see client-side logs in your terminal
            </p>
            <Button />
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Server Logging</h2>
            <p className="text-gray-600 mb-4">
              This component logs during server-side rendering
            </p>
            <ErrorBoundary>
              <UserList />
            </ErrorBoundary>
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Terminal Output</h2>
          <p className="text-gray-600">
            Check your terminal where you ran{' '}
            <code className="bg-gray-100 px-2 py-1 rounded">npm run dev</code>
            to see all the logs from both client and server components.
          </p>
        </div>

        <div className="mt-8 p-6 bg-gray-100 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Debug Tools</h2>
          <a
            href="/debug-logs"
            className="inline-block px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
          >
            Debug Logs Dashboard
          </a>
          <p className="text-sm text-gray-600 mt-2">
            View real-time server logs and debug the logging system.
          </p>
        </div>
      </div>
    </main>
  );
}
