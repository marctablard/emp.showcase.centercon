'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchReturns } from '@/lib/client/returns';
import { Return } from '@/platform/services/model/return';

interface UseReturnsReturn {
  returns: Return[];
  loading: boolean;
  error: Error | null;
  refreshReturns: () => Promise<void>;
}

/**
 * Hook for fetching and managing returns list
 * @param initialReturns Optional initial returns data (from SSR)
 * @param pageSize Optional page size (default: 60)
 * @param pageNumber Optional page number (default: 1)
 */
export function useReturns(initialReturns?: Return[], pageSize?: number, pageNumber?: number): UseReturnsReturn {
  const [returns, setReturns] = useState<Return[]>(initialReturns || []);
  const [loading, setLoading] = useState<boolean>(!initialReturns);
  const [error, setError] = useState<Error | null>(null);

  const fetchReturnsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchReturns(pageSize, pageNumber);
      setReturns(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [pageSize, pageNumber]);

  const refreshReturns = useCallback(async () => {
    await fetchReturnsData();
  }, [fetchReturnsData]);

  // Load returns on initial render if not provided
  useEffect(() => {
    if (!initialReturns) {
      fetchReturnsData();
    }
  }, [initialReturns, fetchReturnsData]);

  return {
    returns,
    loading,
    error,
    refreshReturns,
  };
}
