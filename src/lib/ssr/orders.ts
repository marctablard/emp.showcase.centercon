'use server';

import { cache } from 'react';
import { OrderService } from '@/platform/services/order/OrderService';
import { Order } from '@/platform/services/model/order/order';

/**
 * Get the order service instance from the platform container
 */
const getOrderService = () => globalThis.EMP.platform.ssr.get<OrderService>('OrderService');

/**
 * Get a specific order by ID
 * This function is cached to prevent multiple order fetches in a single request
 */
export const getOrderById = cache(async (orderId: string): Promise<Order | null | undefined> => {
  try {
    const orderService = getOrderService();
    const order = await orderService.getCustomerOrderById(orderId);

    if (!order) {
      console.warn(`Order not found with ID: ${orderId}`);
      return null;
    }

    return order;
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error);
    return undefined;
  }
});

/**
 * Get all orders for the current customer with optional pagination
 * This function is cached to prevent multiple order fetches in a single request
 */
export const getOrders = cache(async (pageSize?: number, pageNumber?: number): Promise<Order[]> => {
  try {
    const orderService = getOrderService();
    const orders = await orderService.getCustomerOrders(pageSize, pageNumber);
    return orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    // On SSR we fail gracefully, so the client can refetch if necessary
    return [];
  }
});

/**
 * Get available status transitions for an order
 * This function is cached to prevent multiple API fetches in a single request
 */
export const getOrderStatusTransitions = cache(async (orderId: string): Promise<string[]> => {
  try {
    const orderService = getOrderService();
    const statusTransitions = await orderService.getOrderStatusTransitions(orderId);
    return statusTransitions;
  } catch (error) {
    console.error(`Error fetching status transitions for order ${orderId}:`, error);
    // On SSR we fail gracefully, so the client can refetch if necessary
    return [];
  }
});
