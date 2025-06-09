'use client';

import { useCallback, useState } from 'react';
import type { PaymentMode } from '@/platform/services/model';
import { useSiteStore } from '@/stores/site-store';

interface UsePaymentModes {
  // Data
  paymentModes: PaymentMode[] | undefined;
  loading: boolean;
  error: Error | null;

  // Actions
  fetchPaymentModes: () => Promise<void>;
  getPaymentModeById: (id: string) => PaymentMode | null;
  getPaymentModeByCode: (code: string) => PaymentMode | null;
}

/**
 * Hook for managing payment modes
 * @returns Payment modes data and operations
 */
export const usePaymentModes = (): UsePaymentModes => {
  // Get site store data
  const {
    paymentModes: storeModes,
    paymentModesLoading: storeLoading,
    setPaymentModes,
    setPaymentModesLoading,
  } = useSiteStore();

  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch payment modes
   */
  const fetchPaymentModes = useCallback(async (): Promise<void> => {
    setError(null);
    setPaymentModesLoading(true);

    try {
      const { getPaymentModes } = await import('@/lib/client/payment');
      const modes = await getPaymentModes();
      setPaymentModes(modes);
    } catch (err) {
      console.error('Error fetching payment modes:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch payment modes'));
    } finally {
      setPaymentModesLoading(false);
    }
  }, [setPaymentModes, setPaymentModesLoading]);

  /**
   * Get a payment mode by its ID
   */
  const getPaymentModeById = useCallback(
    (id: string): PaymentMode | null => {
      return storeModes?.find((mode) => mode.id === id) || null;
    },
    [storeModes],
  );

  /**
   * Get a payment mode by its code
   */
  const getPaymentModeByCode = useCallback(
    (code: string): PaymentMode | null => {
      return storeModes?.find((mode) => mode.code === code) || null;
    },
    [storeModes],
  );

  return {
    paymentModes: storeModes,
    loading: storeLoading,
    error,
    fetchPaymentModes,
    getPaymentModeById,
    getPaymentModeByCode,
  };
};
