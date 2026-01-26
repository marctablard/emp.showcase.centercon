/**
 * Client Logger Utility
 *
 * NOTE: This is a convenience wrapper around `getService<LoggerService>('LoggerService')`.
 *
 * In Next.js client-side code, you can use this function anywhere (React components,
 * stores, utilities) since the DI container returns singletons.
 *
 * Alternative: You could use `getService<LoggerService>('LoggerService')` directly instead.
 * This wrapper exists for convenience (shorter API).
 *
 * @example
 * // In any client-side code (React components, stores, utilities)
 * import { getLogger } from '@/lib/logger/use-logger-client';
 *
 * export async function fetchData() {
 *   const logger = getLogger();
 *   try {
 *     const response = await fetch('/api/data');
 *     logger.debug({ status: response.status }, 'Data fetched successfully');
 *     return response.json();
 *   } catch (error) {
 *     logger.error({ error: error.message }, 'Failed to fetch data');
 *     throw error;
 *   }
 * }
 *
 * @example
 * // Alternative: Use getService directly (no wrapper needed)
 * import { getService } from '@/lib/client/service';
 * import type { LoggerService } from '@/platform/services/logger/LoggerService';
 *
 * const logger = getService<LoggerService>('LoggerService');
 */

'use client';

import { getService } from '@/lib/client/service';
import type { LoggerService } from '@/platform/services/logger/LoggerService';

/**
 * Get the client logger instance
 *
 * Convenience wrapper around `getService<LoggerService>('LoggerService')` that:
 * - Provides a shorter, more semantic API
 *
 * Since the DI container returns singletons, this is safe to call from anywhere
 * in client-side code (React components, stores, utilities, etc.).
 *
 * @returns Logger service instance
 */
export function getLogger(): LoggerService {
  return getService<LoggerService>('LoggerService');
}
