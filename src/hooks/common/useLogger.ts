/**
 * React hook for accessing the logger in client components
 * Provides a stable logger reference that can be used throughout component lifecycle
 */

'use client';

import { useMemo } from 'react';
import client from '@/platform/client';
import type { LoggerService } from '@/platform/services/logger/LoggerService';

/**
 * Hook for accessing the client-side logger
 * Returns a stable logger reference that persists across re-renders
 * @returns Logger service instance
 */
export function useLogger(): LoggerService {
  // Use useMemo to ensure the logger instance is stable across re-renders
  return useMemo(() => client.get<LoggerService>('LoggerService'), []);
}
