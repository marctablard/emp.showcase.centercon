'use client';
import { Cart } from '@/platform/services/model/cart/cart';
import { create } from 'zustand';

export interface CartState {
  // Cart data
  currentCart: Cart | null;
}

interface CartActions {
  // Cart operations
  setCurrentCart: (cart: Cart | null) => void;
  getCurrentCart: () => Cart | null;
}


export type CartStore = CartState & CartActions

const defaultState: CartState = {
  currentCart: null
}

export const createCartStore = (
  initState: CartState = defaultState
) => {
  return create<CartStore>()((set, get) => ({
    ...initState,
    setCurrentCart: (cart: Cart | null) => {
      set({ currentCart: cart })
    },
    getCurrentCart: () => get().currentCart
  }))
}