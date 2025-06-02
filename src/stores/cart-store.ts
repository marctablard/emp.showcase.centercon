'use client';

import { create } from 'zustand';
import { Cart } from '@/platform/services/model/cart/cart';

export interface CartState {
  // Cart data, null means no cart, undefined means unknown state
  currentCart: Cart | null | undefined;
}

interface CartActions {
  // Cart operations
  setCurrentCart: (cart: Cart | null | undefined) => void;
  getCurrentCart: () => Cart | null | undefined;
}

export type CartStore = CartState & CartActions;

const defaultState: CartState = {
  currentCart: null,
};

export const createCartStore = (initState: CartState = defaultState) => {
  return create<CartStore>()((set, get) => ({
    ...initState,
    setCurrentCart: (cart: Cart | null | undefined) => {
      set({ currentCart: cart });
    },
    getCurrentCart: () => get().currentCart,
  }));
};
