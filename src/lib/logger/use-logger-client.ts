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
 *     logger.debug('Data fetched successfully', { status: response.status });
 *     return response.json();
 *   } catch (error) {
 *     logger.error('Failed to fetch data', { error: error.message });
 *     throw error;
 *   }
 * }
 */

'use client';

import type pino from 'pino';
import { getClientLogger } from './client-logger';

/**
 * Get the client logger instance
 * Returns a singleton logger that can be used in any client-side code
 *
 * @returns PINO logger instance configured for client-side logging
 */
export function getLogger(): pino.Logger {
  return getClientLogger();
}

/**
 * Convenience wrapper for logging at specific levels
 * These functions provide a simpler API for one-off logging needs
 */

export function logDebug(message: string, context?: Record<string, unknown>): void {
  const logger = getLogger();
  if (context) {
    logger.debug(context, message);
  } else {
    logger.debug(message);
  }
}

export function logInfo(message: string, context?: Record<string, unknown>): void {
  const logger = getLogger();
  if (context) {
    logger.info(context, message);
  } else {
    logger.info(message);
  }
}

export function logWarn(message: string, context?: Record<string, unknown>): void {
  const logger = getLogger();
  if (context) {
    logger.warn(context, message);
  } else {
    logger.warn(message);
  }
}

export function logError(message: string, context?: Record<string, unknown>): void {
  const logger = getLogger();
  if (context) {
    logger.error(context, message);
  } else {
    logger.error(message);
  }
}

// Re-export the getClientLogger for direct access if needed
export { getClientLogger } from './client-logger';
