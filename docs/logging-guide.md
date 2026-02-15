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

### 2.5 Edge Middleware Logging

The Edge runtime does not use the DI containers, so `LoggerService` is not available in `src/proxy.ts` or `src/site/middleware.ts`. For edge-only logging (for example, misrouted health checks), use structured `console.warn` with JSON payloads:

```typescript
console.warn(
  JSON.stringify({
    event: 'misrouted_healthcheck',
    path: req.nextUrl.pathname,
    method: req.method,
    ua: req.headers.get('user-agent') ?? '',
  }),
);
```

### 2.6 Legacy Console Usage (To Be Migrated)

There are a few legacy `console.error` calls in server utilities that are pending migration to `LoggerService`:

- `src/lib/ssr/products.ts`
- `src/platform/services/session/impl/EmporixSessionService.ts`

New code should use `LoggerService` or `getLogger` as shown above.

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
