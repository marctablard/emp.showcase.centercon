# Search Service Configuration

This document outlines how to configure which search service implementation is used in the Emporix Showcase application.

## Overview

The application supports two search service implementations:

1. **EmporixSearchService**: Uses the Emporix API for product search functionality
2. **BatteryIncludedSearchService**: Uses the Battery Included API for enhanced search capabilities

Both implementations conform to the `SearchService` interface, making them interchangeable within the application's dependency injection system.

## How to Switch Search Service Implementations

The active search service is determined by which implementation class has the `@injectable('SearchService', 'Singleton')` decorator. To switch between implementations, follow these steps:

### Option 1: Use EmporixSearchService

To use the Emporix search implementation:

1. Open `src/platform/services/search/impl/EmporixSearchService.ts`
2. Ensure the class has the `@injectable('SearchService', 'Singleton')` decorator:

```typescript
@injectable('SearchService', 'Singleton')
class EmporixSearchService implements SearchService {
  // Implementation...
}
```

3. Open `src/platform/services/search/impl/BatteryIncludedSearchService.ts`
4. Remove the `@injectable('SearchService', 'Singleton')` decorator if present:

```typescript
// No @injectable decorator
class BatteryIncludedSearchService implements SearchService {
  // Implementation...
}
```

### Option 2: Use BatteryIncludedSearchService

To use the Battery Included search implementation:

1. Open `src/platform/services/search/impl/BatteryIncludedSearchService.ts`
2. Add the `@injectable('SearchService', 'Singleton')` decorator:

```typescript
@injectable('SearchService', 'Singleton')
class BatteryIncludedSearchService implements SearchService {
  // Implementation...
}
```

3. Open `src/platform/services/search/impl/EmporixSearchService.ts`
4. Remove the `@injectable('SearchService', 'Singleton')` decorator:

```typescript
// No @injectable decorator
class EmporixSearchService implements SearchService {
  // Implementation...
}
```

## Implementation Differences

### EmporixSearchService

- Uses `EmporixProductApi` for product data
- Maps products using `EmporixProductMapper`
- Provides basic search functionality
- Currently has placeholder implementations for highlights and recommendations

### BatteryIncludedSearchService

- Uses `BatteryIncludedShopApi` for product data
- Maps products using `BatteryIncludedProductMapper`
- Provides enhanced search capabilities including:
  - Faceted search with filters
  - Advanced suggestions
  - Product recommendations

## Important Notes

1. **Only one implementation** should have the `@injectable('SearchService', 'Singleton')` decorator at a time
2. After changing the implementation, you need to restart the application for changes to take effect
3. The application's dependency injection system will automatically use the decorated implementation throughout the codebase
4. No other code changes are required when switching implementations

## Troubleshooting

If you encounter issues after switching implementations:

1. Verify that only one implementation has the `@injectable('SearchService', 'Singleton')` decorator
2. Ensure that the application has been restarted after making changes
3. Check the browser console for any dependency injection errors
4. Verify that all required dependencies for the chosen implementation are properly configured
