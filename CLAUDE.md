# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a Next.js logging package that unifies client and server logging through a terminal interface. The package enables developers to see all Next.js logs (browser, server, API routes) in their terminal using API Routes.

## Development Commands

```bash
# Package development
npm run dev              # Watch mode compilation with tsup (alias for project:dev)
npm run build           # Build the package (alias for project:build)
npm run project:typecheck # Type check with TypeScript
npm run format          # Check code formatting with Biome (alias for project:format)
npm run format:fix      # Fix code formatting issues (alias for project:format:fix)

# Testing
npm test                # Run all tests (package + test-app)
npm run project:test    # Run Vitest unit tests for package only
npm run test-app:test:vitest # Run Vitest tests in test-app
npm run test-app:test:e2e    # Run Playwright E2E tests in test-app
npm run test-app:test        # Run all test-app tests

# Test app (for development/testing)
npm run test-app:dev    # Start test Next.js app on port 3000
npm run test-app:build  # Build test app
npm run test-app:start  # Start built test app

# Setup and cleanup
npm run npm-install     # Install dependencies for both package and test-app
npm run clean           # Remove all node_modules and build artifacts
npm run project:clean   # Clean only package build artifacts
npm run test-app:clean  # Clean only test-app build artifacts

# Publishing
npm run prepublishOnly  # Automatically runs before publishing
npm run publish-npm     # Publish to npm with public access
npm run can-npm-publish # Check if package can be published
```

## Architecture

### Core Components

- **`src/logger.ts`**: Main `UnifiedLogger` class with client/server detection and stack trace extraction
- **`src/api-route-template.ts`**: API Route template for receiving client logs and outputting to terminal  
- **`src/config.ts`**: Configuration management via environment variables
- **`src/types.ts`**: TypeScript type definitions
- **`src/index.ts`**: Package entry point with default logger instance
- **`src/debug-utils.ts`**: Debug utilities for development and testing with log capture functionality

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
- **E2E tests**: `test-app/tests/e2e/` - Full integration testing with Playwright
- **Test app**: `test-app/` - Real Next.js application for testing package integration
- **Debug utilities**: `src/debug-utils.ts` - Provides log capture functionality for testing

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