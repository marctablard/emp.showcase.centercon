/**
 * Cache configuration for URL pattern-based cache directives
 *
 * Each rule defines:
 * - url: A regex pattern to match against the request pathname
 * - skipIfAuthenticated: If true, skip caching when user is authenticated (default: false)
 * - cache: Optional cache configuration
 *   - revalidate: Time in seconds for ISR revalidation (overrides default)
 *   - tags: Array of cache tags for on-demand revalidation
 *            Use $1, $2, etc. to reference regex capture groups
 */

export interface CacheRule {
  url: string;
  skipIfAuthenticated?: boolean;
  cache?: {
    revalidate?: number;
    tags?: string[];
  };
}

/**
 * Default cache revalidation time in seconds
 * Can be overridden by NEXT_CACHE_DEFAULT_REVALIDATE environment variable
 */
export const DEFAULT_CACHE_REVALIDATE = parseInt(process.env.NEXT_CACHE_DEFAULT_REVALIDATE || '3600', 10);

/**
 * Cache rules applied in order
 * First matching rule wins
 */
export const cacheRules: CacheRule[] = [
  {
    url: '/product/(.*)',
    skipIfAuthenticated: true,
    cache: {
      revalidate: 3600,
      tags: ['product-$1'],
    },
  },
  {
    url: '/api/products/(.*)',
    skipIfAuthenticated: true,
    cache: {
      revalidate: 3600,
      tags: ['product-$1'],
    },
  },
  {
    url: '/api/search/(.*)',
    skipIfAuthenticated: false,
    cache: {
      revalidate: 1800,
      tags: ['search'],
    },
  },
  {
    url: '/category/(.*)',
    skipIfAuthenticated: false,
    cache: {
      revalidate: 7200,
      tags: ['category-$1'],
    },
  },
  {
    url: '/api/categories/(.*)',
    skipIfAuthenticated: false,
    cache: {
      revalidate: 7200,
      tags: ['category'],
    },
  },
];
