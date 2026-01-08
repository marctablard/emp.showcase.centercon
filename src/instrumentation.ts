import { createServerLogger } from '@/lib/logger/server-logger';

/**
 * Next.js instrumentation hook
 * This function is called once when the Next.js server starts
 * Used to initialize server-side logger with pino-pretty configuration
 */
export async function register() {
  // Initialize the server-side logger on application startup
  // This ensures pino-pretty transport is ready before any logging occurs
  const logger = createServerLogger();
  logger.info('Server logger initialized');
}
