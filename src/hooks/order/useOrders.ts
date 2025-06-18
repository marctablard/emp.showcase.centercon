'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchOrders as apiFetchOrders } from '@/lib/client/orders';
import { buildSearchQuery } from '@/platform/integrations/emporix/common/util/common';
import { Order } from '@/platform/services/model/order/order';
import { useOrderStore } from '@/providers/StoreProvider';

interface UseOrdersOptions {
  initialOrders?: Order[];
  pageSize?: number;
  pageNumber?: number;
  filters?: Record<string, any>;
}

interface UseOrdersResult {
  // Orders data
  orders: Order[] | undefined;

  // Status
  loading: boolean;
  error: Error | null;

  // Pagination
  pageSize: number;
  pageNumber: number;
  setPageSize: (size: number) => void;
  setPageNumber: (page: number) => void;

  // Filtering
  filters: Record<string, any>;
  setFilters: (filters: Record<string, any>) => void;

  // Utility
  refetchOrders: () => Promise<void>;
}

/**
 * Hook for managing collections of orders with pagination, filtering, and searching
 *
 * @param options Configuration options for the hook
 * @returns Orders data and operations
 */
export const useOrders = (options: UseOrdersOptions = {}): UseOrdersResult => {
  const {
    initialOrders = undefined,
    pageSize: initialPageSize = 50,
    pageNumber: initialPageNumber = 1,
    filters: initialFilters = {},
  } = options;

  const {
    getOrders: getStoreOrders,
    setOrders: setStoreOrders,
    getLoading: getStoreLoading,
    setLoading: setStoreLoading,
  } = useOrderStore();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const query = buildSearchQuery({
    page: initialPageNumber,
    size: initialPageSize,
    criteria: initialFilters,
  });
  const queryKey = query.query + query.body;
  if (initialOrders && !getStoreLoading(queryKey)) {
    setStoreOrders(queryKey, initialOrders);
    setStoreLoading(queryKey, false);
  }
  const [orders, setOrders] = useState<Order[] | undefined>(initialOrders || getStoreOrders(queryKey));
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [pageNumber, setPageNumber] = useState<number>(initialPageNumber);
  const [filters, setFilters] = useState<Record<string, any>>(initialFilters);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // In a real implementation, you would pass filters to the API
      // For now, we're just using the existing API function
      const ordersData = await apiFetchOrders(pageSize, pageNumber);
      setStoreOrders(queryKey, ordersData);
      setOrders(ordersData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch orders'));
      console.error('Error fetching orders:', err);
    } finally {
      setStoreLoading(queryKey, false);
      setLoading(false);
    }
  }, [pageSize, pageNumber, queryKey, setStoreOrders, setStoreLoading]);

  // Initialize on first render or when pagination/filters change
  useEffect(() => {
    if (orders === undefined) {
      const storeOrders = getStoreOrders(queryKey);
      if (loading) {
        if (!getStoreLoading(queryKey) && storeOrders) {
          setOrders(storeOrders);
          setLoading(false);
        }
      } else {
        setLoading(true);
        if (storeOrders) {
          setOrders(storeOrders);
          setLoading(false);
        } else if (!getStoreLoading(queryKey)) {
          setStoreLoading(queryKey, true);
          fetchOrders();
        } else {
          setLoading(true);
        }
      }
    }
  }, [
    loading,
    pageSize,
    pageNumber,
    filters,
    orders,
    fetchOrders,
    queryKey,
    getStoreLoading,
    getStoreOrders,
    setStoreLoading,
  ]);

  return {
    orders,
    loading,
    error,
    pageSize,
    pageNumber,
    setPageSize,
    setPageNumber,
    filters,
    setFilters,
    refetchOrders: fetchOrders,
  };
};
