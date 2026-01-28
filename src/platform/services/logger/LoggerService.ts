/**
 * Logger service interface
 * Defines the contract for logging functionality across the application
 */

/**
 * Context object that can be attached to log messages
 */
export interface LogContext {
  [key: string]: unknown;
}

/**
 * Logger service interface
 * Provides structured logging methods for different log levels
 * Follows Pino's native API: logger.info([mergingObject], [message])
 * Supports two patterns:
 * - logger.info(message) - message only
 * - logger.info(context, message) - context first, then message (Pino's proper order)
 */
export interface LoggerService {
  /**
   * Log a trace-level message (most verbose)
   * @overload
   * @param message Log message
   */
  trace(message: string): void;
  /**
   * Log a trace-level message with context (Pino order: context first)
   * @overload
   * @param context Context object (merging object in Pino terminology)
   * @param message Log message
   */
  trace(context: LogContext, message: string): void;

  /**
   * Log a debug-level message
   * @overload
   * @param message Log message
   */
  debug(message: string): void;
  /**
   * Log a debug-level message with context (Pino order: context first)
   * @overload
   * @param context Context object (merging object in Pino terminology)
   * @param message Log message
   */
  debug(context: LogContext, message: string): void;

  /**
   * Log an info-level message
   * @overload
   * @param message Log message
   */
  info(message: string): void;
  /**
   * Log an info-level message with context (Pino order: context first)
   * @overload
   * @param context Context object (merging object in Pino terminology)
   * @param message Log message
   */
  info(context: LogContext, message: string): void;

  /**
   * Log a warn-level message
   * @overload
   * @param message Log message
   */
  warn(message: string): void;
  /**
   * Log a warn-level message with context (Pino order: context first)
   * @overload
   * @param context Context object (merging object in Pino terminology)
   * @param message Log message
   */
  warn(context: LogContext, message: string): void;

  /**
   * Log an error-level message
   * @overload
   * @param message Log message
   */
  error(message: string): void;
  /**
   * Log an error-level message with context (Pino order: context first)
   * @overload
   * @param context Context object (merging object in Pino terminology)
   * @param message Log message
   */
  error(context: LogContext, message: string): void;

  /**
   * Log a fatal-level message (most severe)
   * @overload
   * @param message Log message
   */
  fatal(message: string): void;
  /**
   * Log a fatal-level message with context (Pino order: context first)
   * @overload
   * @param context Context object (merging object in Pino terminology)
   * @param message Log message
   */
  fatal(context: LogContext, message: string): void;
}
