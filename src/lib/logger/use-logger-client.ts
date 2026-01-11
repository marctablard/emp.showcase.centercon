/**
 * Client Logger Utility
 * Provides logger access in non-component client-side code
 * (e.g., client libraries, utility functions, stores)
 *
 * Use this when you need to log from client-side code that is not a React component.
 * For React components, prefer using the `useLogger` hook instead.
 *
 * @example
 * // In a client library file
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
 */

'use client';

import type pino from 'pino';
import { getService } from '@/lib/client/service';
import type { LoggerService } from '@/platform/services/logger/LoggerService';

/**
 * Get the client logger instance
 * Returns a logger from the DI container that can be used in any client-side code
 *
 * @returns PINO logger instance configured for client-side logging
 */
export function getLogger(): pino.Logger {
  // Cast to pino.Logger to maintain backward compatibility with existing code
  return getService<LoggerService>('LoggerService') as unknown as pino.Logger;
}
