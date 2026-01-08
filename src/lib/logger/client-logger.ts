/**
 * Client-side logger factory
 * Creates PINO logger instances for use in client components and hooks
 */

'use client';

import pino from 'pino';
import { getClientLoggerConfig } from './config';

let loggerInstance: pino.Logger | null = null;

/**
 * Creates a client-side PINO logger instance
 * Uses singleton pattern to reuse the same logger instance
 * @returns PINO logger instance
 */
export function createClientLogger(): pino.Logger {
  if (loggerInstance) {
    return loggerInstance;
  }

  const config = getClientLoggerConfig();
  loggerInstance = pino(config);

  return loggerInstance;
}

/**
 * Gets the singleton client logger instance
 * Creates it if it doesn't exist
 * @returns PINO logger instance
 */
export function getClientLogger(): pino.Logger {
  return createClientLogger();
}

// Export the logger instance as default for convenience
export default getClientLogger();
