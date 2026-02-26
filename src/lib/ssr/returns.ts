'use server';

import { cache } from 'react';
import type { LoggerService } from '@/platform/services/logger/LoggerService';
import { Return } from '@/platform/services/model/return';
import { ReturnService } from '@/platform/services/return/ReturnService';
import ssr from '@/platform/ssr';

/**
 * Get the return service instance from the platform container
 */
const getReturnService = () => ssr.get<ReturnService>('ReturnService');
const getLogger = () => ssr.get<LoggerService>('LoggerService');

/**
 * Get a specific return by ID
 * This function is cached to prevent multiple return fetches in a single request
 */
export const getReturnById = cache(async (returnId: string): Promise<Return | null | undefined> => {
  try {
    const returnService = getReturnService();
    return await returnService.getReturn(returnId);
  } catch (error) {
    getLogger().error(
      { error: error instanceof Error ? error.message : String(error), returnId },
      'SSR getReturnById failed',
    );
    return undefined;
  }
});

/**
 * Get all returns for the current customer with optional pagination
 * This function is cached to prevent multiple return fetches in a single request
 */
export const getReturns = cache(async (pageNumber?: number, pageSize?: number): Promise<Return[] | undefined> => {
  try {
    const returnService = getReturnService();
    const returns = await returnService.getReturns(pageNumber, pageSize);
    return returns;
  } catch (error) {
    getLogger().error(
      { error: error instanceof Error ? error.message : String(error), pageNumber, pageSize },
      'SSR getReturns failed',
    );
    return undefined;
  }
});
