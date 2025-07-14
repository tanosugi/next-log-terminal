'use client';

import { logger } from 'next-log-terminal';
import { useState } from 'react';
import { serverActions } from '../actions/serveractions';

export default function Button() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    logger.info('Button clicked', {
      count: count + 1,
      timestamp: new Date().toISOString(),
    });
    logger.debug('Current state', {
      prevCount: count,
      newCount: count + 1,
    });
    setCount(count + 1);
  };

  const handleReset = () => {
    logger.warn('Reset button clicked', { previousCount: count });
    setCount(0);
  };

  const handleError = () => {
    try {
      throw new Error('This is a test error from client component');
    } catch (error) {
      logger.error('Test error occurred', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <span className="text-2xl font-bold">Count: {count}</span>
      </div>

      <div className="space-x-2">
        <button
          type="button"
          onClick={handleClick}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Click me
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          Reset
        </button>

        <button
          type="button"
          onClick={handleError}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Test Error
        </button>
        <button
          type="button"
          onClick={() => serverActions()}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Server Action
        </button>
      </div>

      <div className="text-sm text-gray-500">
        <p>• Click "Click me" to see info and debug logs</p>
        <p>• Click "Reset" to see warning logs</p>
        <p>• Click "Test Error" to see error logs</p>
      </div>
    </div>
  );
}
