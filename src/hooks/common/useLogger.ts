/**
 * React hook for accessing the logger in client components
 * Provides a stable logger reference that can be used throughout component lifecycle
 */

'use client';

import { useMemo } from 'react';
import type pino from 'pino';
import client from '@/platform/client';
import type { LoggerService } from '@/platform/services/logger/LoggerService';

/**
 * Hook for accessing the client-side logger
 * Returns a stable logger reference that persists across re-renders
 * @returns PINO logger instance
 */
export function useLogger(): pino.Logger {
  // Use useMemo to ensure the logger instance is stable across re-renders
  // Cast to pino.Logger to maintain backward compatibility with existing code
  return useMemo(() => client.get<LoggerService>('LoggerService') as unknown as pino.Logger, []);
}
