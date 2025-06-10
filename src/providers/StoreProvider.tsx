'use client';

import { type ReactNode, createContext, useContext, useRef } from 'react';
import { useStore } from 'zustand/react';
import { createCartStore } from '@/stores/cart-store';
import { createCheckoutStore } from '@/stores/checkout-store';
import { createCustomerStore } from '@/stores/customer-store';
import { createProductStore } from '@/stores/products-store';
import { createShippingMethodsStore } from '@/stores/shipping-methods-store';
import { createSiteStore } from '@/stores/site-store';

export type ProductStoreApi = ReturnType<typeof createProductStore>;
export const ProductStoreContext = createContext<ProductStoreApi | null>(null);
export type CartStoreApi = ReturnType<typeof createCartStore>;
export const CartStoreContext = createContext<CartStoreApi | null>(null);
export type CheckoutStoreApi = ReturnType<typeof createCheckoutStore>;
export const CheckoutStoreContext = createContext<CheckoutStoreApi | null>(null);
export type SiteStoreApi = ReturnType<typeof createSiteStore>;
export const SiteStoreContext = createContext<SiteStoreApi | null>(null);
export type ShippingMethodsStoreApi = ReturnType<typeof createShippingMethodsStore>;
export const ShippingMethodsStoreContext = createContext<ShippingMethodsStoreApi | null>(null);
export type CustomerStoreApi = ReturnType<typeof createCustomerStore>;
export const CustomerStoreContext = createContext<CustomerStoreApi | null>(null);

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
  const siteStoreRef = useRef<SiteStoreApi | null>(null);
  if (siteStoreRef.current === null) {
    siteStoreRef.current = createSiteStore();
  }
  const shippingMethodsStoreRef = useRef<ShippingMethodsStoreApi | null>(null);
  if (shippingMethodsStoreRef.current === null) {
    shippingMethodsStoreRef.current = createShippingMethodsStore();
  }
  const customerStoreRef = useRef<CustomerStoreApi | null>(null);
  if (customerStoreRef.current === null) {
    customerStoreRef.current = createCustomerStore();
  }
  return (
    <SiteStoreContext.Provider value={siteStoreRef.current}>
      <ShippingMethodsStoreContext.Provider value={shippingMethodsStoreRef.current}>
        <ProductStoreContext.Provider value={productStoreRef.current}>
          <CustomerStoreContext.Provider value={customerStoreRef.current}>
            <CartStoreContext.Provider value={cartStoreRef.current}>
              <CheckoutStoreContext.Provider value={checkoutStoreRef.current}>{children}</CheckoutStoreContext.Provider>
            </CartStoreContext.Provider>
          </CustomerStoreContext.Provider>
        </ProductStoreContext.Provider>
      </ShippingMethodsStoreContext.Provider>
    </SiteStoreContext.Provider>
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

export const useSiteStore = () => {
  const storeContext = useContext(SiteStoreContext);
  if (!storeContext) {
    throw new Error('useSiteStore must be used within StoreProvider');
  }
  return useStore(storeContext);
};

export const useShippingMethodsStore = () => {
  const storeContext = useContext(ShippingMethodsStoreContext);
  if (!storeContext) {
    throw new Error('useShippingMethodsStore must be used within StoreProvider');
  }
  return useStore(storeContext);
};

export const useCustomerStore = () => {
  const storeContext = useContext(CustomerStoreContext);
  if (!storeContext) {
    throw new Error('useCustomerStore must be used within StoreProvider');
  }
  return useStore(storeContext);
};
