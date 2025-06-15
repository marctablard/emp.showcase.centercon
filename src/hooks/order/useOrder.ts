'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  fetchOrderById as apiFetchOrderById,
  fetchOrderStatusTransitions as apiFetchOrderStatusTransitions,
  fetchOrders as apiFetchOrders,
} from '@/lib/client/orders';
import { Order } from '@/platform/services/model/order/order';

interface UseOrderOptions {
  orderId?: string;
  initialOrder?: Order | null;
  initialOrders?: Order[];
  pageSize?: number;
  pageNumber?: number;
}

interface UseOrder {
  // Order data
  order: Order | null | undefined;
  orders: Order[];
  statusTransitions: string[];

  // Status
  loading: boolean;
  error: Error | null;

  // Utility
  refetchOrder: () => Promise<void>;
  refetchOrders: () => Promise<void>;
  refetchStatusTransitions: () => Promise<void>;
}

/**
 * Hook for interacting with orders
 *
 * @param options Configuration options for the hook
 * @returns Order data and operations
 */
export const useOrder = (options: UseOrderOptions = {}): UseOrder => {
  const { orderId, initialOrder, initialOrders, pageSize, pageNumber } = options;
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [order, setOrder] = useState<Order | null | undefined>(initialOrder);
  const [orders, setOrders] = useState<Order[]>(initialOrders || []);
  const [statusTransitions, setStatusTransitions] = useState<string[]>([]);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      setError(null);

      const orderData = await apiFetchOrderById(orderId);
      setOrder(orderData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch order'));
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const ordersData = await apiFetchOrders(pageSize, pageNumber);
      setOrders(ordersData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch orders'));
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, [pageSize, pageNumber]);

  const fetchStatusTransitions = useCallback(async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      setError(null);

      const transitions = await apiFetchOrderStatusTransitions(orderId);
      setStatusTransitions(transitions);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch status transitions'));
      console.error('Error fetching status transitions:', err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // Initialize on first render
  useEffect(() => {
    if (orderId && order === undefined) {
      fetchOrder();
      fetchStatusTransitions();
    } else if (orders.length === 0 && !orderId) {
      fetchOrders();
    }
  }, [orderId, order, orders.length, fetchOrder, fetchOrders, fetchStatusTransitions]);

  return {
    order,
    orders,
    statusTransitions,
    loading,
    error,
    refetchOrder: fetchOrder,
    refetchOrders: fetchOrders,
    refetchStatusTransitions: fetchStatusTransitions,
  };
};
