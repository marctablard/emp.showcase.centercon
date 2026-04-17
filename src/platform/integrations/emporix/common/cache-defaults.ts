/**
 * Shared default revalidation time (in seconds) for opt-in Next `fetch`
 * caching on Emporix integration calls. Passed as the trailing `cacheSeconds`
 * argument to `authenticatedFetch` from cacheable GET/HEAD callers.
 *
 * Reuses the same env var as the HTTP cache middleware
 * (`src/caching/cache-config.ts` → `DEFAULT_CACHE_REVALIDATE`) so a single
 * setting controls the default revalidation window across both layers:
 *
 *   NEXT_CACHE_DEFAULT_REVALIDATE=<seconds>
 *
 * Non-positive or non-numeric values fall back to the built-in default.
 *
 * The integration module intentionally does not import from `src/caching/**`
 * to keep the integration layer decoupled from the HTTP cache middleware;
 * the parsing is duplicated on purpose.
 */
const FALLBACK_DEFAULT_CACHE_REVALIDATE = 3600;

function resolveDefaultCacheRevalidate(): number {
  const raw = process.env.NEXT_CACHE_DEFAULT_REVALIDATE;
  if (raw === undefined || raw === null || raw.trim() === '') {
    return FALLBACK_DEFAULT_CACHE_REVALIDATE;
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return FALLBACK_DEFAULT_CACHE_REVALIDATE;
  }
  return Math.floor(parsed);
}

export const DEFAULT_CACHE_REVALIDATE = resolveDefaultCacheRevalidate();
