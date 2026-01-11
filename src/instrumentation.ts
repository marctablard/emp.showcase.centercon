import server from '@/platform/server';
import type { LoggerService } from '@/platform/services/logger/LoggerService';

/**
 * Next.js instrumentation hook
 * This function is called once when the Next.js server starts
 * Used to initialize server-side logger with pino-pretty configuration
 */
export async function register() {
  // Initialize the server-side logger on application startup
  // This ensures pino-pretty transport is ready before any logging occurs
  const logger = server.get<LoggerService>('LoggerService');
  logger.info('Server logger initialized');
}
