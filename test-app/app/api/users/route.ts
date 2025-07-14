import type { NextRequest } from 'next/server';
import { logger } from 'next-log-terminal';

export async function GET(request: NextRequest) {
  logger.info('API request received', {
    url: request.url,
    method: request.method,
    userAgent: request.headers.get('user-agent')?.substring(0, 50) + '...',
  });

  try {
    logger.debug('Processing GET request for users');

    // Simulate some processing time
    await new Promise((resolve) => setTimeout(resolve, 50));

    const users = [
      { id: 1, name: 'API User 1', email: 'api1@example.com' },
      { id: 2, name: 'API User 2', email: 'api2@example.com' },
    ];

    logger.info('Successfully returning users', { count: users.length });

    return Response.json({
      users,
      timestamp: new Date().toISOString(),
      message: 'Users fetched successfully from API',
    });
  } catch (error) {
    logger.error('Failed to fetch users from API', error);
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
