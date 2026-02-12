# Logging Guide

This guide explains how to use the PINO logger throughout the Emporix Showcase application.

## Overview

The application uses [PINO](https://getpino.io/) for structured JSON logging. PINO is a low-overhead, high-performance logger designed for Node.js applications with excellent Next.js integration.

## Log Levels

PINO supports the following log levels (in order of severity):

| Level   | Value | Description                              | Usage                                |
| ------- | ----- | ---------------------------------------- | ------------------------------------ |
| `trace` | 10    | Most verbose, detailed debugging info   | Deep debugging, rarely needed        |
| `debug` | 20    | Development debugging information        | Development-only debugging           |
| `info`  | 30    | General informational messages           | Standard operations, milestones      |
| `warn`  | 40    | Warning messages                         | Potential issues, recoverable errors |
| `error` | 50    | Error messages                           | Failures, exceptions                 |
| `fatal` | 60    | Critical errors that stop the app        | Catastrophic failures                |

## Environment Configuration

### Server-side Logging

| Variable           | Default (Dev) | Default (Prod) | Description                    |
| ------------------ | ------------- | -------------- | ------------------------------ |
| `NEXT_LOG_LEVEL`   | `debug`       | `info`         | Minimum log level for server   |

### Client-side Logging

| Variable                   | Default (Dev) | Default (Prod) | Description                    |
| -------------------------- | ------------- | -------------- | ------------------------------ |
| `NEXT_PUBLIC_LOG_LEVEL`    | `debug`       | `warn`         | Minimum log level for browser  |
| `NEXT_PUBLIC_LOG_ENABLED`  | `true`        | `true`         | Enable/disable client logging  |

### Example .env Configuration

```bash
# Development
NODE_ENV=development
NEXT_LOG_LEVEL=debug
NEXT_PUBLIC_LOG_LEVEL=debug
NEXT_PUBLIC_LOG_ENABLED=true

# Production
NODE_ENV=production
NEXT_LOG_LEVEL=info
NEXT_PUBLIC_LOG_LEVEL=warn
NEXT_PUBLIC_LOG_ENABLED=true
```

## Usage Examples

### 1. API Routes (Server-side)

Use the `LoggerService` from the server DI container in API routes:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import server from '@/platform/server';
import type { LoggerService } from '@/platform/services/logger/LoggerService';

export async function GET(request: NextRequest) {
  try {
    // Your business logic here
    const result = await someOperation();

    return NextResponse.json(result);
  } catch (error) {
    const logger = server.get<LoggerService>('LoggerService');
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        path: request.nextUrl.pathname,
        method: 'GET',
      },
      'Request failed',
    );

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 2. React Components (Client-side)

Use the `useLogger` hook in React components:

```typescript
'use client';

import { useLogger } from '@/hooks/common/useLogger';

export function MyComponent() {
  const logger = useLogger();

  const handleClick = () => {
    logger.info({ component: 'MyComponent' }, 'Button clicked');
  };

  const handleError = (error: Error) => {
    logger.error(
      { component: 'MyComponent', error: error.message },
      'Component error',
    );
  };

  return (
    <button onClick={handleClick}>Click Me</button>
  );
}
```

### 3. Custom React Hooks

Use the `useLogger` hook within custom hooks:

```typescript
'use client';

import { useLogger } from '@/hooks/common/useLogger';
import { useState, useEffect } from 'react';

export function useCustomData(id: string) {
  const logger = useLogger();
  const [data, setData] = useState(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    logger.debug({ id }, 'Fetching data');

    fetch(`/api/data/${id}`)
      .then(res => res.json())
      .then(data => {
        logger.info({ id }, 'Data fetched successfully');
        setData(data);
      })
      .catch(err => {
        logger.error({ id, error: err.message }, 'Failed to fetch data');
        setError(err);
      });
  }, [id, logger]);

  return { data, error };
}
```

### 4. Client Library Files

Use the `getLogger` utility in non-component client code (utilities, stores, etc.):

```typescript
// src/lib/client/my-service.ts
'use client';

import { getLogger } from '@/lib/logger/use-logger-client';

export async function fetchData(endpoint: string) {
  const logger = getLogger();

  try {
    const response = await fetch(endpoint);

    if (!response.ok) {
      logger.warn({ endpoint, status: response.status }, 'API request failed');
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    logger.error(
      { endpoint, error: error instanceof Error ? error.message : String(error) },
      'API request error',
    );
    throw error;
  }
}
```

### 5. Zustand Stores

Use the `getLogger` utility in Zustand stores:

```typescript
'use client';

import { create } from 'zustand';
import { getLogger } from '@/lib/logger/use-logger-client';

interface MyStore {
  data: string[];
  fetchData: () => Promise<void>;
}

export const useMyStore = create<MyStore>((set) => ({
  data: [],
  fetchData: async () => {
    const logger = getLogger();

    try {
      const response = await fetch('/api/data');
      const data = await response.json();

      logger.info({ count: data.length }, 'Store: Data fetched');
      set({ data });
    } catch (error) {
      logger.error(
        { error: error instanceof Error ? error.message : String(error) },
        'Store: Failed to fetch data',
      );
      throw error;
    }
  },
}));
```

### 6. Platform Services (Server-side)

Inject LoggerService via dependency injection:

```typescript
import { inject } from 'inversify';
import { injectable } from '@/platform/core/di/injectable';
import type { LoggerService } from '@/platform/services/logger/LoggerService';

@injectable('MyService', 'Singleton')
class MyService {
  constructor(
    @inject('LoggerService') private logger: LoggerService
  ) {}

  async doSomething(): Promise<void> {
    this.logger.info('Doing something');
    
    try {
      // Business logic
      this.logger.debug('Operation completed');
    } catch (error) {
      this.logger.error(
        { error: error instanceof Error ? error.message : String(error) },
        'Operation failed',
      );
      throw error;
    }
  }
}
```

## Best Practices

### 1. Always Include Context

Add relevant context to help with debugging:

```typescript
// ❌ Bad - no context
logger.error('Something failed');

// ✅ Good - includes context (context object first, then message)
logger.error(
  { userId, error: error.message, endpoint: '/api/users' },
  'Failed to fetch user',
);
```

### 2. Use Appropriate Log Levels

- **trace**: Only for extremely verbose debugging (rarely used)
- **debug**: Development-only information, disabled in production
- **info**: Significant events (user login, order created)
- **warn**: Potential issues that don't prevent operation
- **error**: Failures that affect functionality
- **fatal**: Critical failures that require immediate attention

### 3. Don't Log Sensitive Data

Never log passwords, tokens, credit card numbers, or PII:

```typescript
// ❌ Bad - logs sensitive data
logger.info({ email, password }, 'User login');

// ✅ Good - omits sensitive data
logger.info({ email, success: true }, 'User login');
```

### 4. Structure Error Logging

Include error details in a consistent format:

```typescript
try {
  await riskyOperation();
} catch (error) {
  logger.error(
    {
      operation: 'riskyOperation',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      userId,
    },
    'Operation failed',
  );
}
```

### 5. Use Child Loggers for Request Context

For request-scoped logging, include request identifiers:

```typescript
logger.info(
  {
    requestId: crypto.randomUUID(),
    method: request.method,
    path: request.nextUrl.pathname,
  },
  'Processing request',
);
```

## Output Format

### Development (pino-pretty)

In development, logs are formatted for human readability:

```
10:30:45.123 INFO: Processing request
    path: "/api/users"
    method: "GET"
```

### Production (JSON)

In production, logs are output as JSON for log aggregation:

```json
{"level":30,"time":1704729045123,"msg":"Processing request","path":"/api/users","method":"GET"}
```

## Browser Log Transmission

Client-side errors and warnings can be transmitted to the server for centralized logging. The application includes a `/api/logs` endpoint that receives browser logs.

Logger configuration is managed in `src/platform/core/config/logger-config.ts`.

## API Request Payload Logging

In development, you can enable logging of outgoing API request bodies by setting:

```env
NEXT_DEBUG_API_PAYLOAD=true
```

This logs the body of all POST/PUT/PATCH requests made through `EmporixApiInvoker` and `EmporixOAuthApi`, respecting the endpoint filtering configured via `NEXT_PUBLIC_DEBUG_API_ENDPOINTS`.

Combined with existing response logging (`NEXT_PUBLIC_DEBUG_API_RESPONSE`), this gives you full request/response visibility:

```env
# Full API debugging in development
NEXT_PUBLIC_DEBUG_API_CURL=true
NEXT_DEBUG_API_PAYLOAD=true
NEXT_PUBLIC_DEBUG_API_RESPONSE=FULL
NEXT_PUBLIC_DEBUG_API_ENDPOINTS=cart,order  # Optional: filter to specific endpoints
```

## Browser DevTools Debug Stream

When `NEXT_PUBLIC_DEBUG_API_RESPONSE` is set to any value other than `off`, the application provides two mechanisms to inspect upstream API calls directly in the browser:

### 1. X-Debug Response Headers

Every response from your Next.js API routes includes debug headers visible in the browser **Network** tab:

| Header                      | Example                             | Description                    |
| --------------------------- | ----------------------------------- | ------------------------------ |
| `X-Debug-Upstream-Url`      | `/cart/showcasedev/carts/abc123`    | Upstream URL (masked)          |
| `X-Debug-Upstream-Status`   | `200`                               | Upstream HTTP status           |
| `X-Debug-Upstream-Duration` | `142ms`                             | Round-trip time                |

These headers are automatically attached by `attachDebugHeaders()` when called in API routes.

### 2. SSE Console Stream (ApiDebugPanel)

A Server-Sent Events stream at `/api/debug/stream` pushes upstream API debug events to the browser in real time. The `ApiDebugPanel` component (loaded in the root layout in dev mode) connects to this stream and pretty-prints each event in the browser **Console**:

- **Collapsible groups** — each API call is a `console.groupCollapsed` (or `console.group` for errors)
- **Color-coded** — green for 2xx, orange for 4xx, red for 5xx
- **JSON pretty-printing** — response bodies are parsed and displayed via `console.dir` with full object expansion
- **Headers as table** — response headers are displayed via `console.table`
- **Duration** — round-trip time shown in the group label

This makes it trivial to inspect large JSON response bodies that would be hard to read as a single-line string in the server terminal.

#### Quick Start

1. Ensure `NEXT_PUBLIC_DEBUG_API_RESPONSE` is set (e.g. `STATUS-BODY`, `FULL`)
2. Start the dev server with `npm run dev`
3. Open your browser's DevTools Console
4. You'll see a "🔌 API Debug Stream connected" message
5. Every upstream API call will appear as a collapsible group

#### Filtering: Show Only Specific API Calls

Use `NEXT_PUBLIC_DEBUG_API_ENDPOINTS` to limit which upstream API calls appear in both the **terminal** and the **browser Console stream**. The value is a comma-separated list of path substrings — only URLs containing at least one of these substrings will be logged.

| Goal | `.env` value |
|------|-------------|
| Log everything (default) | `NEXT_PUBLIC_DEBUG_API_ENDPOINTS=` |
| Only orders + returns | `NEXT_PUBLIC_DEBUG_API_ENDPOINTS=order,return` |
| Only cart calls | `NEXT_PUBLIC_DEBUG_API_ENDPOINTS=cart` |
| Only product + price | `NEXT_PUBLIC_DEBUG_API_ENDPOINTS=product,price` |
| Only session context | `NEXT_PUBLIC_DEBUG_API_ENDPOINTS=session-context` |

**Example — show only orders and returns:**

```bash
# .env
NEXT_PUBLIC_DEBUG_API_CURL=true
NEXT_PUBLIC_DEBUG_API_RESPONSE=STATUS-BODY
NEXT_PUBLIC_DEBUG_API_ENDPOINTS=order,return
```

With this config:
- `/order/showcasedev/orders` → ✅ logged (contains `order`)
- `/return/showcasedev/returns` → ✅ logged (contains `return`)
- `/cart/showcasedev/carts/abc` → ❌ filtered out
- `/session-context/showcasedev/me/context` → ❌ filtered out

> **Tip:** The filter is case-insensitive and matches anywhere in the URL path. After changing the `.env` value, restart the dev server (`npm run dev`).

#### SSR Error Logging

All `lib/ssr/*` functions log errors via `LoggerService` instead of silently swallowing them. When an SSR call fails (e.g. missing auth scope, network error), you'll see an `ERROR`-level log line in the **terminal** like:

```
ERROR [SSR getReturns failed] {"error":"Failed to get returns: ...","pageNumber":1}
```

These errors are always logged regardless of `NEXT_PUBLIC_DEBUG_API_ENDPOINTS` — the endpoint filter only applies to the upstream HTTP request/response debug stream, not to application-level error logs.

#### How to add X-Debug headers to an API route

Use `attachDebugHeaders()` in your API route after fetching from an upstream service:

```typescript
import { attachDebugHeaders } from '@/platform/core/utils/debug-utils';

export async function GET() {
  const startTime = Date.now();
  const upstream = await someService.fetch(url);
  
  const response = NextResponse.json(data);
  attachDebugHeaders(response, upstream, url, startTime);
  return response;
}
```

## Troubleshooting

### Logs Not Appearing

1. Check the log level configuration
2. Ensure `NEXT_PUBLIC_LOG_ENABLED` is `true` for client logs
3. Verify the logger is properly imported

### pino-pretty Not Working

1. Ensure `pino-pretty` is installed as a dev dependency
2. Check that `NODE_ENV=development`
3. Restart the development server

### TypeScript Errors

Ensure you're importing from the correct location:
- React Components: `import { useLogger } from '@/hooks/common/useLogger'`
- Client libraries/stores: `import { getLogger } from '@/lib/logger/use-logger-client'`
- API routes (server): `import server from '@/platform/server'` then `server.get<LoggerService>('LoggerService')`
- Platform services (DI): `@inject('LoggerService') private logger: LoggerService`

### Logger API Pattern

The logger follows PINO's native API where the context object comes first, then the message:

```typescript
// ✅ Correct - context first, message second (PINO native order)
logger.error({ error: err.message }, 'Operation failed');

// ❌ Incorrect - message first, context second
logger.error('Operation failed', { error: err.message });
```

The logger supports both patterns for convenience:
- `logger.error(message)` - message only
- `logger.error(context, message)` - context first, then message (recommended)

## Related Documentation

- [Dependency Injection](./dependency-injection.md)
- [Layered Architecture](./layered-architecture.md)
- [Environment Variables](./environment-variables.md)
- [PINO Documentation](https://getpino.io/)
