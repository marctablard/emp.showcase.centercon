import pino from 'pino';
import { getServerLoggerConfig } from './config';

let loggerInstance: pino.Logger | null = null;

/**
 * Creates a server-side PINO logger instance
 * Uses singleton pattern to reuse the same logger instance
 * @returns PINO logger instance
 */
export function createServerLogger(): pino.Logger {
  if (loggerInstance) {
    return loggerInstance;
  }

  const config = getServerLoggerConfig();
  loggerInstance = pino(config);

  return loggerInstance;
}

/**
 * Gets the singleton server logger instance
 * Creates it if it doesn't exist
 * @returns PINO logger instance
 */
export function getServerLogger(): pino.Logger {
  return createServerLogger();
}

// Export the logger instance as default for convenience
export default getServerLogger();
