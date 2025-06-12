'use client';

import { type ReactNode, createContext, useContext, useRef } from 'react';
import { useStore } from 'zustand/react';
import { createCartStore } from '@/stores/cart-store';
import { createCheckoutStore } from '@/stores/checkout-store';
import { createHistoryStore } from '@/stores/history-store';
import { createProductStore } from '@/stores/products-store';

export type ProductStoreApi = ReturnType<typeof createProductStore>;
export const ProductStoreContext = createContext<ProductStoreApi | null>(null);
export type CartStoreApi = ReturnType<typeof createCartStore>;
export const CartStoreContext = createContext<CartStoreApi | null>(null);
export type CheckoutStoreApi = ReturnType<typeof createCheckoutStore>;
export const CheckoutStoreContext = createContext<CheckoutStoreApi | null>(null);
export type HistoryStoreApi = ReturnType<typeof createHistoryStore>;
export const HistoryStoreContext = createContext<HistoryStoreApi | null>(null);

export interface StoreProviderProps {
  children: ReactNode;
}

export const StoreProvider = ({ children }: StoreProviderProps) => {
  const productStoreRef = useRef<ProductStoreApi | null>(null);
  if (productStoreRef.current === null) {
    productStoreRef.current = createProductStore();
  }
  const cartStoreRef = useRef<CartStoreApi | null>(null);
  if (cartStoreRef.current === null) {
    cartStoreRef.current = createCartStore();
  }
  const checkoutStoreRef = useRef<CheckoutStoreApi | null>(null);
  if (checkoutStoreRef.current === null) {
    checkoutStoreRef.current = createCheckoutStore();
  }
  const historyStoreRef = useRef<HistoryStoreApi | null>(null);
  if (historyStoreRef.current === null) {
    historyStoreRef.current = createHistoryStore();
  }
  return (
    <ProductStoreContext.Provider value={productStoreRef.current}>
      <CartStoreContext.Provider value={cartStoreRef.current}>
        <CheckoutStoreContext.Provider value={checkoutStoreRef.current}>
          <HistoryStoreContext.Provider value={historyStoreRef.current}>{children}</HistoryStoreContext.Provider>
        </CheckoutStoreContext.Provider>
      </CartStoreContext.Provider>
    </ProductStoreContext.Provider>
  );
};

export const useProductStore = () => {
  const storeContext = useContext(ProductStoreContext);
  if (!storeContext) {
    throw new Error(`useProductStore must be used within StoreProvider`);
  }
  return useStore(storeContext);
};

export const useCartStore = () => {
  const storeContext = useContext(CartStoreContext);
  if (!storeContext) {
    throw new Error('useCartStore must be used within StoreProvider');
  }
  return useStore(storeContext);
};

export const useCheckoutStore = () => {
  const storeContext = useContext(CheckoutStoreContext);
  if (!storeContext) {
    throw new Error('useCheckoutStore must be used within StoreProvider');
  }
  return useStore(storeContext);
};

export const useHistoryStore = () => {
  const storeContext = useContext(HistoryStoreContext);
  if (!storeContext) {
    throw new Error('useHistoryStore must be used within StoreProvider');
  }
  return useStore(storeContext);
};
