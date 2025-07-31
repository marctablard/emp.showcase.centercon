# Emporix API Client for Next.js

This module provides a TypeScript implementation of the Emporix API for use in Next.js applications. It is designed to work with the InversifyJS dependency injection system.

## Features

- OAuth authentication (anonymous, customer, and service tokens)
- Token caching and automatic refresh
- TypeScript interfaces for API responses
- Injectable services compatible with InversifyJS

## Usage

### Setup

1. Register the services in your InversifyJS container:

```typescript
// In your container configuration
import { Container } from 'inversify';
import { EmporixApiClient } from './integration/apis/emporix/EmporixApiClient';
import { EmporixConfig } from './integration/apis/emporix/config';
import { DefaultEmporixOAuthApi } from './integration/apis/emporix/impl/DefaultEmporixOAuthApi';
import { OAuthApi } from './integration/apis/emporix/types/apis/OAuthApi';

const container = new Container();

// Register the OAuth API implementation
container.bind<OAuthApi>('OAuthApi').to(DefaultEmporixOAuthApi);

// Register the Emporix API client
container.bind<EmporixApiClient>(EmporixApiClient).toSelf();

// Register the Emporix configuration
container.bind<EmporixConfig>('EmporixConfig').toConstantValue({
  baseUrl: 'https://api.emporix.io',
  tenant: 'your-tenant-id',
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
});
```

### Using the API Client

```typescript
// In your service or component
import { inject, injectable } from 'inversify';
import { EmporixApiClient } from './integration/apis/emporix/EmporixApiClient';

@injectable()
export class ProductService {
  constructor(@inject(EmporixApiClient) private emporixClient: EmporixApiClient) {}

  async getProducts() {
    // Get an anonymous token for public access
    const token = await this.emporixClient.getAnonymousToken();

    // Make an authenticated request
    const response = await this.emporixClient.authenticatedFetch(
      'https://api.emporix.io/product/products',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      'anonymous', // Use anonymous token
    );

    return response.json();
  }

  // Example of a method requiring service access token
  async createProduct(productData: any) {
    const response = await this.emporixClient.authenticatedFetch(
      'https://api.emporix.io/product/products',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      },
      'service', // Use service token
    );

    return response.json();
  }
}
```

## API Reference

### EmporixApiClient

The main client for interacting with Emporix APIs.

#### Methods

- `getAnonymousToken()`: Get an anonymous token for accessing public resources
- `getCustomerToken(username, password)`: Get a customer token for authenticated user access
- `getServiceAccessToken([clientId], [clientSecret])`: Get a service access token for administrative operations
- `authenticatedFetch(url, options, tokenType)`: Create a fetch request with the appropriate authentication headers
- `clearTokens()`: Clear all stored tokens

### TokenManager

Manages token caching and refreshing.

#### Methods

- `getAnonymousToken(tenant)`: Get a valid anonymous token, refreshing if necessary
- `getCustomerToken(tenant, username, password)`: Get a valid customer token, refreshing if necessary
- `getServiceAccessToken(tenant, clientId, clientSecret)`: Get a valid service access token, refreshing if necessary
- `clearTokens()`: Clear all stored tokens
