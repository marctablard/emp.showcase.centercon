/**
 * Logger configuration utilities
 * Provides environment detection and log level resolution for PINO logger
 */
import pino from 'pino';

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/**
 * Checks if the current environment is development
 * @returns true if NODE_ENV is 'development'
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Gets the log level for server-side logging
 * Reads from NEXT_LOG_LEVEL environment variable or uses defaults
 * @returns Log level string
 */
export function getServerLogLevel(): LogLevel {
  const envLevel = process.env.NEXT_LOG_LEVEL?.toLowerCase() as LogLevel | undefined;

  if (envLevel && ['trace', 'debug', 'info', 'warn', 'error', 'fatal'].includes(envLevel)) {
    return envLevel;
  }

  // Default: debug in development, info in production
  return isDevelopment() ? 'debug' : 'info';
}

/**
 * Gets the log level for client-side logging
 * Reads from NEXT_PUBLIC_LOG_LEVEL environment variable or uses defaults
 * @returns Log level string
 */
export function getClientLogLevel(): LogLevel {
  const envLevel = process.env.NEXT_PUBLIC_LOG_LEVEL?.toLowerCase() as LogLevel | undefined;

  if (envLevel && ['trace', 'debug', 'info', 'warn', 'error', 'fatal'].includes(envLevel)) {
    return envLevel;
  }

  // Default: debug in development, warn in production
  return isDevelopment() ? 'debug' : 'warn';
}

/**
 * Checks if client-side logging is enabled
 * Reads from NEXT_PUBLIC_LOG_ENABLED environment variable
 * @returns true if logging is enabled (default: true)
 */
export function isClientLoggingEnabled(): boolean {
  const enabled = process.env.NEXT_PUBLIC_LOG_ENABLED;
  if (enabled === 'false') {
    return false;
  }
  // Default: enabled in both dev and prod
  return true;
}

/**
 * Gets server-side PINO logger configuration
 * @returns PINO configuration object
 */
export function getServerLoggerConfig() {
  const isDev = isDevelopment();
  const level = getServerLogLevel();

  return {
    level,
    ...(isDev && {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss.l',
          ignore: 'pid,hostname',
        },
      },
    }),
  };
}

/**
 * Gets client-side PINO logger configuration
 * @returns PINO browser configuration object
 */
export function getClientLoggerConfig() {
  const isDev = isDevelopment();
  const level = getClientLogLevel();
  const enabled = isClientLoggingEnabled();

  if (!enabled) {
    // Return a no-op logger configuration
    return {
      level: 'silent' as const,
      browser: {
        asObject: false,
        write: () => {}, // No-op write function
      },
    };
  }

  return {
    level,
    serializers: {
      err: pino.stdSerializers.err, // Enable error serialization
    },
    browser: {
      asObject: true, // Output JSON objects for structured logging
      serialize: true, // Enable serializers in browser (required for Error objects)
      reportCaller: isDev, // Include file:line:column in development
    },
  };
}
