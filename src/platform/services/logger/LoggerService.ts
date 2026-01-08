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
 */
export interface LoggerService {
  /**
   * Log a trace-level message (most verbose)
   * @param message Log message
   * @param context Optional context object
   */
  trace(message: string, context?: LogContext): void;

  /**
   * Log a debug-level message
   * @param message Log message
   * @param context Optional context object
   */
  debug(message: string, context?: LogContext): void;

  /**
   * Log an info-level message
   * @param message Log message
   * @param context Optional context object
   */
  info(message: string, context?: LogContext): void;

  /**
   * Log a warn-level message
   * @param message Log message
   * @param context Optional context object
   */
  warn(message: string, context?: LogContext): void;

  /**
   * Log an error-level message
   * @param message Log message
   * @param context Optional context object
   */
  error(message: string, context?: LogContext): void;

  /**
   * Log a fatal-level message (most severe)
   * @param message Log message
   * @param context Optional context object
   */
  fatal(message: string, context?: LogContext): void;
}
