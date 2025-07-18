'use client';

import { useCallback, useEffect, useState } from 'react';
import { requiresApproval as apiRequiresApproval } from '@/lib/client/approval';

/**
 * Interface for the return value of the useApprovalCheck hook
 */
interface UseApprovalCheckReturn {
  requiresApproval: boolean;
  loading: boolean;
  error: Error | null;
  setCartId: (cartId: string | undefined) => void;

  checkApproval: () => Promise<boolean>;
}

/**
 * Hook for checking if a cart requires approval
 * @param cartId The ID of the cart to check
 */
export function useApprovalCheckout(initialCartId?: string): UseApprovalCheckReturn {
  const [cartId, setCartId] = useState<string | undefined>(initialCartId);
  const [requiresApproval, setRequiresApproval] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const checkApproval = useCallback(async (): Promise<boolean> => {
    if (!cartId) return false;

    try {
      setLoading(true);
      setError(null);

      const result = await apiRequiresApproval(cartId);
      setRequiresApproval(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setRequiresApproval(false);
      return false;
    } finally {
      setLoading(false);
    }
  }, [cartId]);

  // Check approval requirement when cartId changes
  useEffect(() => {
    if (cartId) {
      checkApproval();
    } else {
      setRequiresApproval(false);
    }
  }, [cartId, checkApproval]);

  return {
    requiresApproval,
    loading,
    error,
    setCartId,
    checkApproval,
  };
}

export default useApprovalCheckout;
