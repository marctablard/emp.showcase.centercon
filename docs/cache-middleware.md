# Cache Middleware

## Overview

The cache middleware provides a centralized, pattern-based approach to managing HTTP cache directives across the application. It allows fine-grained control over caching behavior based on URL patterns and authentication state without modifying individual page or route implementations.

## Architecture

The cache middleware consists of three main components:

1. **`cache-config.ts`** - Configuration file defining cache rules
2. **`cache-middleware.ts`** - Middleware implementation that applies cache directives
3. **`proxy.ts`** - Integration point where the middleware is applied

## Why Use Cache Middleware Instead of Page-Level Configuration?

### 1. **Centralized Cache Management**

Instead of setting `export const revalidate` or `export const dynamic` on individual pages/routes, all caching logic is managed in one place (`cache-config.ts`). This provides:

- **Single source of truth** for cache policies
- **Easier maintenance** - update cache rules without touching page implementations
- **Consistency** across the application
- **Reduced code duplication** - no need to repeat cache configuration in every file

### 2. **Dynamic Authentication-Aware Caching**

The middleware can dynamically adjust caching behavior based on user authentication state:

```typescript
{
  url: '/product/(.*)',
  skipIfAuthenticated: true,  // Cache only for anonymous users
  cache: {
    revalidate: 3600,
    tags: ['product-$1'],
  },
}
```

**Why this matters:**
- **Anonymous users** see cached product pages (fast performance, reduced server load)
- **Authenticated users** get fresh data (personalized pricing, availability, etc.)
- **No code changes** needed in the actual product page implementation

With page-level configuration (`export const dynamic = 'force-static'`), you cannot differentiate between authenticated and anonymous users - it's all or nothing.

### 3. **Non-Invasive Implementation**

The middleware approach doesn't require modifying existing page or route implementations:

- **Original code stays clean** - no cache-specific exports cluttering your components
- **Easy to enable/disable** - toggle via `NEXT_CACHE_MIDDLEWARE_ENABLED` environment variable
- **Gradual adoption** - add cache rules incrementally without refactoring existing code
- **Testing flexibility** - disable caching for tests without code changes

### 4. **Pattern-Based Flexibility**

URL patterns with regex support and capture groups enable sophisticated caching strategies:

```typescript
{
  url: '/product/(.*)',
  cache: {
    revalidate: 3600,
    tags: ['product-$1'],  // $1 references the captured product ID
  },
}
```

This allows:
- **Dynamic cache tags** for on-demand revalidation
- **Different rules for different URL patterns**
- **Fine-grained control** without touching individual routes

### 5. **Separation of Concerns**

Cache policy is separated from business logic:

- **Product pages** focus on rendering products
- **API routes** focus on data fetching
- **Cache middleware** handles caching concerns
- **Easy to change** cache strategies without understanding page internals

## Configuration

### Environment Variables

Add to your `.env` file:

```bash
# Enable/disable cache middleware (default: true)
NEXT_CACHE_MIDDLEWARE_ENABLED=true

# Default cache revalidation time in seconds (default: 3600)
NEXT_CACHE_DEFAULT_REVALIDATE=3600
```

### Cache Rules

Define cache rules in `src/cache-config.ts`:

```typescript
export const cacheRules: CacheRule[] = [
  {
    url: '/product/(.*)',           // Regex pattern to match URLs
    skipIfAuthenticated: true,       // Skip caching for logged-in users
    cache: {
      revalidate: 3600,              // Cache for 1 hour
      tags: ['product-$1'],          // Cache tags with captured groups
    },
  },
  // ... more rules
];
```

### Rule Properties

- **`url`** - Regex pattern to match against request pathname
- **`skipIfAuthenticated`** - If `true`, skip caching when user is authenticated (default: `false`)
- **`cache.revalidate`** - Time in seconds for ISR revalidation (overrides default)
- **`cache.tags`** - Array of cache tags for on-demand revalidation
  - Use `$1`, `$2`, etc. to reference regex capture groups

### Rule Matching

- Rules are evaluated in order
- **First matching rule wins**
- If no rule matches, no cache headers are set
- If a rule matches but `skipIfAuthenticated` is true and user is authenticated, caching is skipped

## How It Works

1. **Request comes in** → Next.js middleware intercepts it
2. **Authentication check** → `authMiddleware` determines if user is logged in
3. **Site routing** → `siteMiddleware` handles multi-site routing
4. **Cache middleware** → `applyCacheDirectives()` is called with authentication state
5. **Pattern matching** → URL is matched against cache rules
6. **Cache headers set** → If rule matches and conditions are met:
   - `Cache-Control` header is set (e.g., `public, max-age=3600, s-maxage=3600, stale-while-revalidate=7200`)
   - `X-Cache-Tags` header is set with processed tags
7. **Response returned** → Browser/CDN receives response with cache directives

## Example Use Cases

### Product Pages

```typescript
{
  url: '/product/(.*)',
  skipIfAuthenticated: true,
  cache: {
    revalidate: 3600,
    tags: ['product-$1'],
  },
}
```

- Anonymous users get cached pages (1 hour)
- Authenticated users always get fresh data
- Can revalidate specific products via tag: `revalidateTag('product-123')`

### Category Pages

```typescript
{
  url: '/category/(.*)',
  skipIfAuthenticated: false,
  cache: {
    revalidate: 7200,
    tags: ['category-$1'],
  },
}
```

- All users get cached pages (2 hours)
- Can revalidate specific categories via tag: `revalidateTag('category-electronics')`

### Search Results

```typescript
{
  url: '/api/search/(.*)',
  skipIfAuthenticated: false,
  cache: {
    revalidate: 1800,
    tags: ['search'],
  },
}
```

- All search results cached for 30 minutes
- Can revalidate all search results via tag: `revalidateTag('search')`

## Cache Revalidation

### Time-Based (ISR)

Automatic revalidation after the specified time:

```typescript
cache: {
  revalidate: 3600,  // Revalidate after 1 hour
}
```

### Tag-Based (On-Demand)

Revalidate specific cached content programmatically:

```typescript
import { revalidateTag } from 'next/cache';

// Revalidate all product pages
revalidateTag('product-123');

// Revalidate all search results
revalidateTag('search');
```

## Comparison with Page-Level Configuration

| Aspect | Cache Middleware | Page-Level Config |
|--------|------------------|-------------------|
| **Location** | Centralized in `cache-config.ts` | Scattered across pages |
| **Authentication-aware** | ✅ Yes | ❌ No |
| **Dynamic behavior** | ✅ Yes | ❌ No |
| **Easy to change** | ✅ Yes | ❌ Requires code changes |
| **Pattern-based** | ✅ Yes | ❌ File-by-file |
| **Non-invasive** | ✅ Yes | ❌ Modifies page code |
| **Can be disabled** | ✅ Via env variable | ❌ Requires code changes |

## Development

### Debug Logging

In development mode, the middleware logs cache decisions:

```
[Cache Middleware] Applied to /product/123: {
  revalidate: 3600,
  tags: ['product-123'],
  isAuthenticated: false
}

[Cache Middleware] Skipped for /product/456: user is authenticated
```

### Testing

Disable cache middleware for tests:

```bash
NEXT_CACHE_MIDDLEWARE_ENABLED=false
```

## Best Practices

1. **Order rules from specific to general** - More specific patterns should come first
2. **Use authentication-aware caching** - Set `skipIfAuthenticated: true` for personalized content
3. **Use cache tags** - Enable on-demand revalidation for better control
4. **Set appropriate revalidation times** - Balance freshness vs. performance
5. **Monitor cache headers** - Use browser DevTools to verify cache behavior
6. **Document your rules** - Add comments explaining why specific rules exist

## Migration from Page-Level Config

If you have existing pages with cache configuration:

**Before:**
```typescript
// app/product/[id]/page.tsx
export const revalidate = 3600;
export const dynamic = 'force-dynamic'; // for authenticated users

export default function ProductPage() {
  // ...
}
```

**After:**
```typescript
// app/product/[id]/page.tsx
// No cache configuration needed!

export default function ProductPage() {
  // ...
}
```

```typescript
// cache-config.ts
{
  url: '/product/(.*)',
  skipIfAuthenticated: true,
  cache: {
    revalidate: 3600,
    tags: ['product-$1'],
  },
}
```

## Troubleshooting

### Cache not working

1. Check `NEXT_CACHE_MIDDLEWARE_ENABLED=true` in your `.env`
2. Verify URL pattern matches your route
3. Check if `skipIfAuthenticated` is blocking caching
4. Look for development logs in console

### Cache too aggressive

1. Lower `revalidate` value
2. Use `skipIfAuthenticated: true` for personalized content
3. Implement on-demand revalidation with tags

### Cache not respecting authentication

1. Ensure cache middleware is called inside `authMiddleware` in `proxy.ts`
2. Verify `!!req.auth?.user` is passed correctly
3. Check rule has `skipIfAuthenticated: true`

## Related Files

- `src/cache-config.ts` - Cache rule configuration
- `src/cache-middleware.ts` - Middleware implementation
- `src/proxy.ts` - Integration point
- `.env.template` - Environment variable examples
