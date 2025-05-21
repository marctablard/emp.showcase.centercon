# Dependency Injection Framework Documentation

## Overview

Our Dependency Injection (DI) framework provides a robust, type-safe way to manage dependencies throughout the React Whitelabel Storefront application. It enables loose coupling between components, making the codebase more maintainable, testable, and flexible.

## Why Dependency Injection?

1. **Separation of Concerns**: Each component focuses on its specific functionality without worrying about how its dependencies are created or managed.

2. **Testability**: Dependencies can be easily mocked during testing, allowing for isolated unit tests.

3. **Code Reusability**: Services and components can be reused across different parts of the application.

4. **Environment-Specific Implementations**: The framework supports different implementations for client and server environments, critical for Next.js applications.

5. **Centralized Configuration**: All service registrations are managed in one place, making it easier to understand and modify the application's architecture.

## Technical Foundation

Our DI framework is built on [InversifyJS](https://inversify.io/), a powerful inversion of control container for TypeScript & JavaScript applications. We've extended Inversify with custom functionality to support:

- Automatic container generation
- Environment-specific implementations (client vs. server)
- Layer-based organization (Integrations, Services, Repositories)
- File watching for development

## Core Principles

1. **Interface-Based Design**: Services are defined by interfaces, allowing for multiple implementations.

2. **Layer Separation**: The application is divided into distinct layers (Integrations, Services, Repositories), each with its own container.

3. **Environment Awareness**: The framework automatically selects the appropriate implementation based on the execution environment (client or server).

4. **Code Generation**: Container configurations are automatically generated, reducing boilerplate and potential errors.

5. **Explicit Dependencies**: Dependencies are explicitly declared through constructor injection, making the code more readable and maintainable.

## Usage Guide

### Defining a Service Interface

First, define an interface that describes the service's contract:

```typescript
// src/platform/services/hello/UserAgentService.d.ts
export interface UserAgentService {
    getUserAgent() : Promise<string> 
}
```

### Creating Implementations

Implement the interface with one or more concrete classes:

#### Server Implementation

```typescript
// src/platform/services/hello/impl/UserAgentServiceServer.ts
import { headers } from "next/headers";
import type { UserAgentService } from "../UserAgentService";
import { injectable } from "@/integration/common/di/injectable";

@injectable('UserAgentService', 'Singleton')
class UserAgentServiceServer implements UserAgentService {
    async getUserAgent() : Promise<string> {
        const headersList = await headers()
        return headersList.get('user-agent') || 'No UserAgent supplied on Request'
    }
}
    
export default UserAgentServiceServer;
```

#### Client Implementation

```typescript
// src/platform/services/hello/impl/UserAgentServiceClient.ts
import type { UserAgentService } from "../UserAgentService";
import { injectable } from "@/integration/common/di/injectable";

@injectable('UserAgentService', 'Singleton')
export class UserAgentServiceClient implements UserAgentService {
    getUserAgent() : Promise<string> {
        return Promise.resolve(window.navigator.userAgent)
    }
}
```

### Using the Injectable Decorator

The `@injectable` decorator is a key part of our DI system:

```typescript
@injectable(id?: string | symbol, scope?: BindingScope)
```

- **id**: The identifier used to resolve the service (typically the interface name)
- **scope**: The lifecycle of the instance ('Singleton', 'Transient', or 'Request')

### Consuming Services

Services can be consumed by other services through constructor injection:

```typescript
// src/platform/services/hello/impl/HelloAgentService.ts
import type { HelloService } from "../HelloService";
import { injectable } from "@/integration/common/di/injectable";
import type { UserAgentService } from "../UserAgentService";
import { inject } from "inversify";

@injectable('HelloService', 'Singleton')
class HelloAgentService implements HelloService {

    constructor(
        @inject('UserAgentService') private userAgentService: UserAgentService
    ) {}

    async sayHello(): Promise<string> {
        try {   
            const userAgent = await this.userAgentService.getUserAgent()
            
            return `Hello Agent! Your browser agent is: ${userAgent}`;
        } catch (error) {
            console.error('Error reading server-only file:', error);
            return 'Hello Server Error (file could not be read)';
        }
    }
}

export default HelloAgentService;
```

### Why Different Implementations Are Necessary

In our example with `UserAgentService`, we have separate implementations for client and server because:

1. **Server-Side Rendering**: In server components, we need to access the user agent from the request headers.
2. **Client-Side Execution**: In the browser, we access the user agent from the `window.navigator` object.
3. **Code Splitting**: Server-only code should not be included in client bundles and vice versa.
4. **Environment-Specific APIs**: Some APIs are only available in one environment.

The DI framework automatically selects the correct implementation based on the execution context, making the code that consumes these services simpler and more maintainable.

## Container Generation

Our DI framework includes a code generation system that automatically creates container configuration files. This reduces boilerplate code and ensures consistency.

### Generation Scripts

The following scripts are available in `package.json`:

```json
"scripts": {
  "generate": "ts-node --project scripts/tsconfig.json scripts/di-generator.ts",
  "generate:watch": "ts-node --project scripts/tsconfig.json scripts/di-generator.ts --watch"
}
```

- **generate**: Scans the codebase for `@injectable` decorators and generates container files.
- **generate:watch**: Continuously watches for changes and regenerates containers as needed.

### How Generation Works

1. The generator scans directories for TypeScript files with `@injectable` decorators.
2. It identifies which layer each injectable belongs to (Integration, Service, Repository).
3. It determines if the implementation is client-only, server-only, or common.
4. It generates container files that:
   - Import all relevant modules
   - Register them with the appropriate container
   - Provide a type-safe way to resolve dependencies

### Watch Mode

The watch mode feature:

1. Only regenerates containers for the specific layer where changes are detected
2. Uses Node.js native fs.watch API for reliable file monitoring
3. Ignores index.ts files in base paths to prevent recursive regeneration
4. Uses debouncing to avoid excessive regeneration

## Best Practices

1. **Always define interfaces**: Create clear contracts for your services.
2. **Use meaningful identifiers**: The ID in `@injectable('ServiceId')` should be descriptive.
3. **Prefer constructor injection**: This makes dependencies explicit and enables proper testing.
4. **Consider lifecycle scopes**: Use 'Singleton' for stateless services and 'Transient' for stateful ones.
5. **Separate client and server code**: Use naming conventions like `ServiceClient.ts` and `ServiceServer.ts`.

## Conclusion

Our Dependency Injection framework provides a solid foundation for building maintainable, testable, and flexible applications. By following the patterns and practices outlined in this documentation, you can leverage the full power of dependency injection in your Next.js application.
