/**
 * Client-side PINO logger service implementation
 * Provides logging functionality for client components using PINO logger
 */

'use client';

import pino from 'pino';
import { getClientLoggerConfig } from '@/platform/core/config/logger-config';
import { injectable } from '@/platform/core/di/injectable';
import type { LogContext, LoggerService } from '../LoggerService';

/**
 * Client-side logger service implementation
 * Registered in the client container for use in client components and browser code
 */
@injectable('LoggerService', 'Singleton')
class PinoLoggerServiceClient implements LoggerService {
  private logger: pino.Logger;

  constructor() {
    const config = getClientLoggerConfig();
    this.logger = pino(config);
  }

  trace(message: string): void;
  trace(context: LogContext, message: string): void;
  trace(messageOrContext: string | LogContext, message?: string): void {
    if (message === undefined) {
      // Single argument: just message
      this.logger.trace(messageOrContext as string);
    } else {
      // Two arguments: context first, then message (Pino native order)
      this.logger.trace(messageOrContext as LogContext, message);
    }
  }

  debug(message: string): void;
  debug(context: LogContext, message: string): void;
  debug(messageOrContext: string | LogContext, message?: string): void {
    if (message === undefined) {
      // Single argument: just message
      this.logger.debug(messageOrContext as string);
    } else {
      // Two arguments: context first, then message (Pino native order)
      this.logger.debug(messageOrContext as LogContext, message);
    }
  }

  info(message: string): void;
  info(context: LogContext, message: string): void;
  info(messageOrContext: string | LogContext, message?: string): void {
    if (message === undefined) {
      // Single argument: just message
      this.logger.info(messageOrContext as string);
    } else {
      // Two arguments: context first, then message (Pino native order)
      this.logger.info(messageOrContext as LogContext, message);
    }
  }

  warn(message: string): void;
  warn(context: LogContext, message: string): void;
  warn(messageOrContext: string | LogContext, message?: string): void {
    if (message === undefined) {
      // Single argument: just message
      this.logger.warn(messageOrContext as string);
    } else {
      // Two arguments: context first, then message (Pino native order)
      this.logger.warn(messageOrContext as LogContext, message);
    }
  }

  error(message: string): void;
  error(context: LogContext, message: string): void;
  error(messageOrContext: string | LogContext, message?: string): void {
    if (message === undefined) {
      // Single argument: just message
      this.logger.error(messageOrContext as string);
    } else {
      // Two arguments: context first, then message (Pino native order)
      this.logger.error(messageOrContext as LogContext, message);
    }
  }

  fatal(message: string): void;
  fatal(context: LogContext, message: string): void;
  fatal(messageOrContext: string | LogContext, message?: string): void {
    if (message === undefined) {
      // Single argument: just message
      this.logger.fatal(messageOrContext as string);
    } else {
      // Two arguments: context first, then message (Pino native order)
      this.logger.fatal(messageOrContext as LogContext, message);
    }
  }
}

export default PinoLoggerServiceClient;
