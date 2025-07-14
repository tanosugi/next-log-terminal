'use client';

import { logger } from 'next-log-terminal';
import { useEffect, useState } from 'react';

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  args: any[];
  metadata?: any;
}

export default function DebugLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/test-logs');
      const data = await response.json();
      setLogs(data.logs || []);
      setIsCapturing(data.isCapturing || false);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  const startCapture = async () => {
    try {
      await fetch('/api/test-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      });
      await fetchLogs();
    } catch (error) {
      console.error('Failed to start capture:', error);
    }
  };

  const stopCapture = async () => {
    try {
      await fetch('/api/test-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' }),
      });
      await fetchLogs();
    } catch (error) {
      console.error('Failed to stop capture:', error);
    }
  };

  const clearLogs = async () => {
    try {
      await fetch('/api/test-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear' }),
      });
      await fetchLogs();
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  };

  const generateDemoLogs = async () => {
    try {
      // Generate various types of logs using the logger library
      logger.info('Demo: Button clicked', {
        count: 1,
        timestamp: new Date().toISOString(),
        demoType: 'info',
      });

      logger.warn('Demo: Warning message', {
        warning: 'This is a test warning',
        demoType: 'warn',
      });

      logger.error('Demo: Error occurred', new Error('This is a demo error'), {
        demoType: 'error',
      });

      // Note: logger.log() might not exist, using console.log which should be captured
      console.log('Demo: General log message', {
        data: 'some debug data',
        id: 12345,
        demoType: 'log',
      });

      // Wait a bit then refresh logs
      setTimeout(fetchLogs, 500);
    } catch (error) {
      console.error('Failed to generate demo logs:', error);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    return log.level === filter;
  });

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchLogs, 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchLogs]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-red-600';
      case 'warn':
        return 'text-yellow-600';
      case 'info':
        return 'text-blue-600';
      case 'log':
        return 'text-gray-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Debug Logs Dashboard</h1>

      {/* Usage Instructions */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-lg font-semibold mb-3 text-blue-800">
          How to Use This Dashboard
        </h2>
        <div className="space-y-2 text-sm text-blue-700">
          <p>
            <strong>1. Start Capture:</strong> Click "Start Capture" to begin
            monitoring server console logs
          </p>
          <p>
            <strong>2. Generate Activity:</strong> Use "Generate Demo Logs" or
            interact with the main app (click buttons, visit /api/users)
          </p>
          <p>
            <strong>3. View Logs:</strong> Real-time logs will appear in the
            terminal-style display below
          </p>
          <p>
            <strong>4. Filter:</strong> Use the level filter to show only
            specific log types (info, warn, error)
          </p>
          <p>
            <strong>5. Auto-Refresh:</strong> Enable auto-refresh for real-time
            updates, or click "Refresh" manually
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <div className="flex flex-wrap gap-4 items-center">
          <button
            type="button"
            onClick={startCapture}
            disabled={isCapturing}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            Start Capture
          </button>

          <button
            type="button"
            onClick={stopCapture}
            disabled={!isCapturing}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400"
          >
            Stop Capture
          </button>

          <button
            type="button"
            onClick={clearLogs}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Clear Logs
          </button>

          <button
            type="button"
            onClick={fetchLogs}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh
          </button>

          <button
            type="button"
            onClick={generateDemoLogs}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Generate Demo Logs
          </button>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="mr-2"
            />
            Auto Refresh
          </label>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Filter:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="all">All Levels</option>
              <option value="info">Info</option>
              <option value="warn">Warn</option>
              <option value="error">Error</option>
              <option value="log">Log</option>
            </select>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-sm ${isCapturing ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
          >
            {isCapturing ? 'Capturing' : 'Stopped'}
          </span>

          <span className="text-sm text-gray-600">
            Total logs: {logs.length} | Showing: {filteredLogs.length}
          </span>
        </div>
      </div>

      {/* Log Display */}
      <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <div className="text-gray-500">
            {logs.length === 0
              ? "No logs captured yet. Click 'Start Capture' and 'Generate Demo Logs' to see logs appear here."
              : `No logs match the '${filter}' filter. Try selecting 'All Levels' or generate demo logs.`}
          </div>
        ) : (
          filteredLogs.map((log, index) => (
            <div key={index} className="mb-2 border-b border-gray-700 pb-2">
              <div className="flex items-start gap-4">
                <span className="text-gray-400 text-xs whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span
                  className={`font-bold uppercase text-xs ${getLevelColor(log.level)}`}
                >
                  {log.level}
                </span>
                <span className="flex-1">{log.message}</span>
              </div>
              {log.args && log.args.length > 0 && (
                <div className="ml-20 mt-1 text-yellow-300">
                  {log.args.map((arg, argIndex) => (
                    <div key={argIndex} className="text-xs">
                      {typeof arg === 'object'
                        ? JSON.stringify(arg, null, 2)
                        : String(arg)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Back to Home */}
      <div className="mt-6">
        <a
          href="/"
          className="inline-block px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}
