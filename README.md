
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
- 🚀 **Server Actions**: No API routes needed - uses Next.js Server Actions
- 🎨 **Pretty Output**: Color-coded logs with timestamps and file locations
- ⚡ **Zero Config**: Works out of the box with sensible defaults
- 🔧 **Fully Configurable**: Customize output format via environment variables
- 📦 **Lightweight**: Minimal impact on bundle size
- 🔍 **Stack Traces**: Automatic file name and line number detection
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

1. **Create a server action file** (`app/actions/logger.ts`):

```typescript
export { serverLog } from 'next-log-terminal/server';
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

Configure via environment variables in `.env.local`:

```bash
# Display options
NEXT_PUBLIC_LOG_TIMESTAMP=true      # Show timestamps (default: true)
NEXT_PUBLIC_LOG_FILENAME=true       # Show file names (default: true)
NEXT_PUBLIC_LOG_LINENUMBER=true     # Show line numbers (default: true)
NEXT_PUBLIC_LOG_FUNCTION=false      # Show function names (default: false)
NEXT_PUBLIC_LOG_COLORS=true         # Enable colors (default: true)

# Log level
NEXT_PUBLIC_LOG_LEVEL=debug         # error | warn | info | log | debug (default: log)
```

### Programmatic Configuration

```typescript
import { logger } from 'next-log-terminal';

// Update configuration at runtime
logger.updateConfig({
  showTimestamp: false,
  showFileName: false,
  logLevel: 'warn',
});
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
  showFunctionName: boolean;   // Display function name
  useColors: boolean;          // Use ANSI colors
  logLevel: 'error' | 'warn' | 'info' | 'log' | 'debug';
}
```

## 🎨 Output Format

### Default Format
```
[HH:MM:SS.mmm] [ENVIRONMENT/LEVEL] path/to/file.ts:line:column in functionName()
→ Your log message
```

### Examples

```bash
# Client-side log
[14:25:37.123] [CLIENT/INFO] app/components/Header.tsx:15:5 in Header()
→ Navigation menu opened

# Server-side log
[14:25:37.256] [SERVER/WARN] app/lib/auth.ts:42:10 in validateSession()
→ Session expires soon { userId: "123", expiresIn: "5m" }

# Error with stack trace
[14:25:37.389] [CLIENT/ERROR] app/pages/checkout.tsx:78:15 in processPayment()
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

### Custom Logger Instance

```typescript
import { UnifiedLogger } from 'next-log-terminal';

const customLogger = new UnifiedLogger();
customLogger.updateConfig({
  showTimestamp: false,
  logLevel: 'error',
});

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
- **Lazy loading**: Server action is only loaded when needed

## 🔍 Troubleshooting

### Logs not appearing in terminal?

1. Ensure server action is properly exported
2. Check that Server Actions are enabled in `next.config.js`
3. Verify environment variables are loaded

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
# 開発
npm install
npm run dev

# テスト
npm test          # Vitestユニットテスト
npm run test:e2e  # PlaywrightのE2Eテスト
npm run test:all  # すべてのテスト

# ビルド
npm run build

# テストアプリの起動
npm run dev:test-app

# パッケージの公開
npm publish
```