'use client';

import { useCallback, useEffect, useState } from 'react';
import { getMockReturnById } from '@/components/account/returns/mock-returns-data';
import { fetchReturnById } from '@/lib/client/returns';
import { Return } from '@/platform/services/model/return';

interface UseReturnReturn {
  returnItem: Return | null;
  loading: boolean;
  error: Error | null;
  refreshReturn: () => Promise<void>;
}

/**
 * Hook for fetching and managing a single return
 * @param returnId The ID of the return to fetch
 * @param initialReturn Optional initial return data (from SSR)
 */
export function useReturn(returnId: string, initialReturn?: Return | null): UseReturnReturn {
  const [returnItem, setReturnItem] = useState<Return | null>(initialReturn || null);
  const [loading, setLoading] = useState<boolean>(!initialReturn);
  const [error, setError] = useState<Error | null>(null);

  const fetchReturn = useCallback(async () => {
    if (!returnId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await fetchReturnById(returnId);
      // Use API result or fall back to mock data for UI verification
      const result = data || getMockReturnById(returnId) || null;
      setReturnItem(result);
    } catch (err) {
      if (err instanceof Error && err.message === 'Return not found') {
        // Try mock data fallback
        const mockReturn = getMockReturnById(returnId);
        setReturnItem(mockReturn || null);
      } else {
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      setLoading(false);
    }
  }, [returnId]);

  const refreshReturn = useCallback(async () => {
    await fetchReturn();
  }, [fetchReturn]);

  // Load return on initial render if not provided
  useEffect(() => {
    if (!initialReturn && returnId) {
      fetchReturn();
    }
  }, [initialReturn, returnId, fetchReturn]);

  return {
    returnItem,
    loading,
    error,
    refreshReturn,
  };
}
