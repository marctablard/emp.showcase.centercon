'use client';

import { create } from 'zustand';
import { Cart } from '@/platform/services/model/cart/cart';

export interface CartState {
  // Cart data, null means no cart, undefined means unknown state
  currentCart: Cart | null | undefined;
  loading: boolean;
}

interface CartActions {
  // Cart operations
  setCurrentCart: (cart: Cart | null | undefined) => void;
  getCurrentCart: () => Cart | null | undefined;
  setLoading: (loading: boolean) => void;
  getLoading: () => boolean;
}
export type CartStore = CartState & CartActions;

// default state explicitely 'undefined' since it means, we don't know the cart's state
const defaultState: CartState = {
  currentCart: undefined,
  loading: false,
};

export const createCartStore = (initState: CartState = defaultState) => {
  return create<CartStore>()((set, get) => ({
    ...initState,
    setCurrentCart: (cart: Cart | null | undefined) => {
      set((state) => {
        if (cart === state.currentCart) {
          return state;
        }
        return { currentCart: cart, loading: false };
      });
    },
    getCurrentCart: () => get().currentCart,
    setLoading: (loading: boolean) => set({ loading }),
    getLoading: () => get().loading,
  }));
};
