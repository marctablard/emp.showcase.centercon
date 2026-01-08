/**
 * React hook for accessing the logger in client components
 * Provides a stable logger reference that can be used throughout component lifecycle
 */

'use client';

import { useMemo } from 'react';
import type pino from 'pino';
import { getClientLogger } from '@/lib/logger/client-logger';

/**
 * Hook for accessing the client-side logger
 * Returns a stable logger reference that persists across re-renders
 * @returns PINO logger instance
 */
export function useLogger(): pino.Logger {
  // Use useMemo to ensure the logger instance is stable across re-renders
  return useMemo(() => getClientLogger(), []);
}
