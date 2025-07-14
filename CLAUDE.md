# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a Next.js logging package that unifies client and server logging through a terminal interface. The package enables developers to see all Next.js logs (browser, server, API routes) in their terminal using API Routes.

## Development Commands

```bash
# Package development
npm run dev              # Watch mode compilation with tsup
npm run build           # Build the package
npm run typecheck       # Type check with TypeScript
npm run format          # Check code formatting with Biome
npm run format:fix      # Fix code formatting issues

# Testing
npm test                # Run Vitest unit tests  
npm run test:e2e        # Run Playwright E2E tests
npm run test:all        # Run all tests

# Test app (for development/testing)
npm run dev:test-app    # Start test Next.js app on port 3000
npm run build:test-app  # Build test app

# Cleanup
npm run clean           # Remove all node_modules and build artifacts
```

## Architecture

### Core Components

- **`src/logger.ts`**: Main `UnifiedLogger` class with client/server detection and stack trace extraction
- **`src/api-route-template.ts`**: API Route template for receiving client logs and outputting to terminal  
- **`src/config.ts`**: Configuration management via environment variables
- **`src/types.ts`**: TypeScript type definitions
- **`src/index.ts`**: Package entry point with default logger instance

### Build System

- **tsup**: Builds both CommonJS and ESM formats with dual entry points
- **Dual exports**: Main package (`index.ts`) and API route template (`api-route-template.ts`) 
- **Client directives**: Build process adds `'use client'` to main bundle

### Key Features

- **Stack trace extraction**: Automatically captures file paths, line numbers, and function names
- **Environment detection**: Differentiates between client and server contexts
- **API transport**: Uses fetch API to send client logs to API Route endpoint
- **Configurable output**: Environment variables control timestamp, colors, log levels, API endpoint, etc.

### Test Structure

- **Unit tests**: `tests/unit/` - Core functionality testing with Vitest
- **E2E tests**: `tests/e2e/` - Full integration testing with Playwright
- **Test app**: `test-app/` - Real Next.js application for testing package integration

## Integration Pattern

Users create an API route file (typically `app/api/log-terminal/route.ts`):
```typescript
export { POST } from 'next-log-terminal/api-route';
```

Then use the unified logger anywhere:
```typescript
import { logger } from 'next-log-terminal';
logger.info('Message from client or server');
```

## Important Notes

- API Routes are used instead of Server Actions for better reliability
- Client logs are sent via fetch API to the configured endpoint (default: `/api/log-terminal`)
- Stack trace parsing handles webpack-internal paths and browser URLs
- Fallback to console methods if API logging fails
- Environment variables prefixed with `NEXT_PUBLIC_LOG_` for configuration
- API endpoint URL configurable via `NEXT_PUBLIC_LOG_API_ENDPOINT`