import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { logger } from 'next-log-terminal';

export function middleware(request: NextRequest) {
  logger.info('Middleware executed', {
    path: request.nextUrl.pathname,
    method: request.method,
    userAgent: `${request.headers.get('user-agent')?.substring(0, 100)}...`,
    timestamp: new Date().toISOString(),
  });

  // Add custom header for demonstration
  const response = NextResponse.next();
  response.headers.set('x-middleware-executed', 'true');

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
