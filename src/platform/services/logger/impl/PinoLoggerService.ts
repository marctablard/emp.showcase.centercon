/**
 * PINO logger service implementation
 * Provides logging functionality using PINO logger with environment-based configuration
 */
import { createClientLogger } from '@/lib/logger/client-logger';
import { createServerLogger } from '@/lib/logger/server-logger';
import { injectable } from '@/platform/core/di/injectable';
import type { LogContext, LoggerService } from '../LoggerService';

/**
 * PINO logger service implementation
 * Automatically detects server vs client context and uses appropriate logger
 */
@injectable('LoggerService', 'Singleton')
class PinoLoggerService implements LoggerService {
  private logger: ReturnType<typeof createServerLogger> | ReturnType<typeof createClientLogger>;

  constructor() {
    // Detect if we're in a server or client context
    if (typeof window === 'undefined') {
      // Server-side: use server logger
      this.logger = createServerLogger();
    } else {
      // Client-side: use client logger
      this.logger = createClientLogger();
    }
  }

  trace(message: string, context?: LogContext): void {
    if (context) {
      this.logger.trace(context, message);
    } else {
      this.logger.trace(message);
    }
  }

  debug(message: string, context?: LogContext): void {
    if (context) {
      this.logger.debug(context, message);
    } else {
      this.logger.debug(message);
    }
  }

  info(message: string, context?: LogContext): void {
    if (context) {
      this.logger.info(context, message);
    } else {
      this.logger.info(message);
    }
  }

  warn(message: string, context?: LogContext): void {
    if (context) {
      this.logger.warn(context, message);
    } else {
      this.logger.warn(message);
    }
  }

  error(message: string, context?: LogContext): void {
    if (context) {
      this.logger.error(context, message);
    } else {
      this.logger.error(message);
    }
  }

  fatal(message: string, context?: LogContext): void {
    if (context) {
      this.logger.fatal(context, message);
    } else {
      this.logger.fatal(message);
    }
  }
}

export default PinoLoggerService;
