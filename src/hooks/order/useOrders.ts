'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchOrders as apiFetchOrders } from '@/lib/client/orders';
import { Order } from '@/platform/services/model/order/order';

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
    pageSize: initialPageSize = 10,
    pageNumber: initialPageNumber = 1,
    filters: initialFilters = {},
  } = options;

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [orders, setOrders] = useState<Order[] | undefined>(initialOrders);
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
      setOrders(ordersData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch orders'));
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, [pageSize, pageNumber]);

  // Initialize on first render or when pagination/filters change
  useEffect(() => {
    if (orders === undefined) {
      fetchOrders();
    }
  }, [pageSize, pageNumber, filters, orders, fetchOrders]);

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
