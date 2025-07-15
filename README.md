
```markdown
# next-log-terminal

<p align="center">
  <strong>See all your Next.js logs in the terminal - browser, server, everywhere</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/next-log-terminal">
    <img src="https://img.shields.io/npm/v/next-log-terminal.svg" alt="npm version" />
  </a>
  <a href="https://github.com/yourusername/next-log-terminal/actions">
    <img src="https://github.com/yourusername/next-log-terminal/workflows/CI/badge.svg" alt="CI Status" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/npm/l/next-log-terminal.svg" alt="License" />
  </a>
</p>

## ✨ Features

- 🌐 **Unified Logging**: Same API for both client and server components
- 🖥️ **Terminal Output**: See browser console logs in your terminal
- 🚀 **API Routes**: Uses Next.js API Routes for reliable client-to-server log transport
- 🎨 **Pretty Output**: Color-coded logs with timestamps and file locations
- ⚡ **Zero Config**: Works out of the box with sensible defaults
- 🔧 **Fully Configurable**: Customize output format via environment variables
- 📦 **Lightweight**: Minimal impact on bundle size
- 🔍 **Stack Traces**: Automatic file name and line number detection
- 🛡️ **Function Sanitization**: Automatically handles function objects to prevent ugly display
- 🎯 **TypeScript**: Full type safety and IntelliSense support

## 📸 Screenshot

```
[14:25:37.123] [CLIENT/INFO] app/components/Button.tsx:12:5 in handleClick()
→ User clicked the button { count: 5 }

[14:25:37.256] [SERVER/LOG] app/api/users/route.ts:8:5 in GET()
→ Fetching users from database

[14:25:37.389] [CLIENT/ERROR] app/components/Form.tsx:45:10 in validateForm()
→ Validation failed Error: Email is required
  Path: /contact
  User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...
```

## 🚀 Quick Start

### Installation

```bash
npm install next-log-terminal
# or
yarn add next-log-terminal
# or
pnpm add next-log-terminal
```

### Basic Setup

1. **Create an API route file** (`app/api/log-terminal/route.ts`):

```typescript
export { POST } from 'next-log-terminal/api-route';
```

2. **Use the logger anywhere**:

```typescript
import { logger } from 'next-log-terminal';

// In any component (client or server)
logger.info('Hello from Next.js!');
logger.error('Something went wrong', error);
logger.debug('Debug info', { userId: 123 });
```

That's it! Your browser logs now appear in your terminal. 🎉

## 📖 Usage

### Client Components

```typescript
'use client';

import { logger } from 'next-log-terminal';

export function Button() {
  const handleClick = () => {
    logger.info('Button clicked');
    logger.debug('Current state', { timestamp: Date.now() });
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

### Server Components

```typescript
import { logger } from 'next-log-terminal';

export async function UserList() {
  logger.info('Fetching users...');
  
  try {
    const users = await fetchUsers();
    logger.debug('Users fetched', { count: users.length });
    return <div>{/* render users */}</div>;
  } catch (error) {
    logger.error('Failed to fetch users', error);
    throw error;
  }
}
```

### API Routes

```typescript
import { logger } from 'next-log-terminal';

export async function GET(request: Request) {
  logger.info('API request received', {
    url: request.url,
    headers: request.headers,
  });

  return Response.json({ message: 'Hello' });
}
```

## ⚙️ Configuration

Configure the logger using environment variables in your `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_LOG_TIMESTAMP: 'true',        // Show timestamps
    NEXT_PUBLIC_LOG_FILENAME: 'true',         // Show file names
    NEXT_PUBLIC_LOG_LINENUMBER: 'true',       // Show line numbers
    NEXT_PUBLIC_LOG_COLORS: 'true',           // Use colors
    NEXT_PUBLIC_LOG_LEVEL: 'debug',           // Log level
    NEXT_PUBLIC_LOG_API_ENDPOINT: '/api/log-terminal',    // API endpoint
    NEXT_PUBLIC_LOG_DETAIL_IN_BROWSER: 'true',  // Detailed browser formatting
  },
};

export default nextConfig;
```

Or set them as environment variables:

```bash
# .env.local
NEXT_PUBLIC_LOG_TIMESTAMP=true
NEXT_PUBLIC_LOG_FILENAME=true
NEXT_PUBLIC_LOG_LINENUMBER=true
NEXT_PUBLIC_LOG_COLORS=true
NEXT_PUBLIC_LOG_LEVEL=debug
NEXT_PUBLIC_LOG_API_ENDPOINT=/api/log-terminal
NEXT_PUBLIC_LOG_DETAIL_IN_BROWSER=true
```

## 📚 API Reference

### Logger Methods

```typescript
logger.log(message: string, ...args: any[])    // General logging
logger.info(message: string, ...args: any[])   // Information
logger.warn(message: string, ...args: any[])   // Warnings
logger.error(message: string, ...args: any[])  // Errors
logger.debug(message: string, ...args: any[])  // Debug (only in development)

// Utility methods
logger.group(label: string)                    // Start a log group
logger.groupEnd()                              // End a log group
logger.table(data: any, columns?: string[])    // Display tabular data
logger.time(label: string)                     // Start a timer
logger.timeEnd(label: string)                  // End a timer
logger.count(label: string)                    // Count occurrences
logger.assert(condition: any, message: string) // Assertion logging
```

### Configuration Options

```typescript
interface LoggerConfig {
  showTimestamp: boolean;      // Display timestamp
  showFileName: boolean;       // Display file name
  showLineNumber: boolean;     // Display line number
  useColors: boolean;          // Use ANSI colors
  logLevel: 'error' | 'warn' | 'info' | 'log' | 'debug';
  apiEndpoint: string;         // API endpoint for client logs
  showDetailInBrowser: boolean; // Show detailed formatting in browser console
}
```

All options can be configured via environment variables:

| Environment Variable | Type | Default | Description |
|---------------------|------|---------|-------------|
| `NEXT_PUBLIC_LOG_TIMESTAMP` | boolean | `true` | Show timestamps in logs |
| `NEXT_PUBLIC_LOG_FILENAME` | boolean | `true` | Show file names in logs |
| `NEXT_PUBLIC_LOG_LINENUMBER` | boolean | `true` | Show line numbers in logs |
| `NEXT_PUBLIC_LOG_COLORS` | boolean | `true` | Use ANSI colors in terminal output |
| `NEXT_PUBLIC_LOG_LEVEL` | string | `log` | Minimum log level (`error`, `warn`, `info`, `log`, `debug`) |
| `NEXT_PUBLIC_LOG_API_ENDPOINT` | string | `/api/log-terminal` | API endpoint for client-to-server logging |
| `NEXT_PUBLIC_LOG_DETAIL_IN_BROWSER` | boolean | `true` | Show detailed formatting in browser console |

## 🎨 Output Format

### Default Format
```
[HH:MM:SS.mmm] [ENVIRONMENT/LEVEL] path/to/file.ts:line:column
→ Your log message
```

### Examples

```bash
# Client-side log
[14:25:37.123] [CLIENT/INFO] app/components/Header.tsx:15:5
→ Navigation menu opened

# Server-side log
[14:25:37.256] [SERVER/WARN] app/lib/auth.ts:42:10
→ Session expires soon { userId: "123", expiresIn: "5m" }

# Error with stack trace
[14:25:37.389] [CLIENT/ERROR] app/pages/checkout.tsx:78:15
→ Payment failed Error: Card declined
  Path: /checkout
  User-Agent: Mozilla/5.0...
```

## 🤝 Integration Examples

### With Error Boundaries

```typescript
'use client';

import { logger } from 'next-log-terminal';

export function ErrorBoundary({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  logger.error('Error boundary caught', error);
  
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### With Data Fetching

```typescript
import { logger } from 'next-log-terminal';

async function fetchWithLogging(url: string) {
  logger.time(`fetch-${url}`);
  logger.info('Starting fetch', { url });
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    logger.info('Fetch successful', { 
      status: response.status,
      size: JSON.stringify(data).length 
    });
    
    return data;
  } catch (error) {
    logger.error('Fetch failed', { url, error });
    throw error;
  } finally {
    logger.timeEnd(`fetch-${url}`);
  }
}
```

## 🔧 Advanced Usage

### Function Object Handling

The logger automatically sanitizes function objects to prevent ugly console output:

```typescript
import { logger } from 'next-log-terminal';

const myFunction = () => console.log('hello');
const serverAction = async () => { /* server action */ };

// Instead of displaying {toString: ƒ, valueOf: ƒ, call: ƒ, apply: ƒ}
// The logger shows: [Function: myFunction] and [Function: serverAction]
logger.info('Functions:', myFunction, serverAction);

// Output in terminal:
// [14:25:37.123] [CLIENT/INFO] app/components/MyComponent.tsx:12:5
// → Functions: [Function: myFunction] [Function: serverAction]
```

This prevents the confusing function object representations that can clutter your logs.

### Custom Logger Instance

```typescript
import { UnifiedLogger } from 'next-log-terminal';

// Create a custom logger instance (uses same config as global logger)
const customLogger = new UnifiedLogger();

export { customLogger };
```

### Middleware Integration

```typescript
import { logger } from 'next-log-terminal';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  logger.info('Middleware executed', {
    path: request.nextUrl.pathname,
    method: request.method,
  });

  return NextResponse.next();
}
```

## 📊 Performance

- **Minimal overhead**: Logs are sent asynchronously
- **No blocking**: Failed server logs fall back to console
- **Tree-shakeable**: Unused methods are removed in production
- **Lazy loading**: API route is only loaded when needed

## 🔍 Troubleshooting

### Logs not appearing in terminal?

1. Ensure API route is properly exported from `app/api/log-terminal/route.ts`
2. Check that the API endpoint is accessible
3. Verify environment variables are loaded correctly

### File paths showing as "Unknown"?

- This usually happens with minified code
- Enable source maps in development
- Some bundlers may obscure stack traces

### Colors not working?

- Check if your terminal supports ANSI colors
- Try setting `FORCE_COLOR=1` environment variable
- Disable colors with `NEXT_PUBLIC_LOG_COLORS=false`

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

```bash
# Clone the repo
git clone https://github.com/yourusername/next-log-terminal.git

# Install dependencies
npm install

# Run tests
npm test

# Start development
npm run dev
```

## 📄 License

MIT © [Your Name]

---

<p align="center">
  Made with ❤️ for the Next.js community
</p>
```

### 使用方法
```bash
# Development
npm install
npm run dev

# Testing
npm test                     # All tests (package + test-app)
npm run project:test         # Package unit tests only
npm run test-app:test:e2e    # E2E tests only
npm run test-app:test        # Test-app tests only

# Building
npm run build

# Test app
npm run test-app:dev

# Publishing
npm run publish-npm
```