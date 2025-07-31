'use client';

import { create } from 'zustand';
import { Order } from '@/platform/services/model/order/order';

export interface OrderState {
  // Site data
  orderQueries: Record<string, string[]>;
  orders: Record<string, Order>;
  loading: Record<string, boolean>;
  updated: number;
}
interface OrderActions {
  setOrders: (query: string, orders: Order[]) => void;
  getOrders: (query: string) => Order[] | undefined;

  setLoading: (query: string, loading: boolean) => void;
  getLoading: (query: string) => boolean;

  reset: () => void;
}
export type OrderStore = OrderState & OrderActions;

const defaultState: OrderState = {
  orderQueries: {},
  orders: {},
  loading: {},
  updated: 0,
};

export const createOrderStore = () =>
  create<OrderStore>()((set, get) => ({
    ...defaultState,
    setOrders: (query: string, orders: Order[]) => {
      // Store order IDs in the query mapping
      const orderIds = orders.map((order) => order.id);
      const orderQueries = {
        ...get().orderQueries,
        [query]: orderIds,
      };

      // Add each order to the orders record with its ID as the key
      const orderRecords = get().orders;
      orders.forEach((order: Order) => {
        orderRecords[order.id] = order;
      });

      // Update the store with the new orders
      set((state) => ({
        ...state,
        orders: orderRecords,
        orderQueries: orderQueries,
        updated: state.updated + 1,
      }));
    },
    getOrders: (query: string) => {
      const ids: string[] = get().orderQueries[query];
      return ids ? ids.map((id) => get().orders[id]) : undefined;
    },
    setLoading: (query: string, loading: boolean) => set({ loading: { ...get().loading, [query]: loading } }),
    getLoading: (query: string) => get().loading[query],
    reset: () => set(defaultState),
  }));
