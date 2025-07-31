'use client';

import { type ReactNode, createContext, useContext, useRef } from 'react';
import { useStore } from 'zustand/react';
import { Site } from '@/platform/services/model/common/site';
import { Session } from '@/platform/services/model/session';
import { createCartStore } from '@/stores/cart-store';
import { createCheckoutStore } from '@/stores/checkout-store';
import { createCustomerStore } from '@/stores/customer-store';
import { createDashboardStore } from '@/stores/dashboard-store';
import { createHistoryStore } from '@/stores/history-store';
import { createNotificationStore } from '@/stores/notification-store';
import { createOrderStore } from '@/stores/order-store';
import { createProductStore } from '@/stores/products-store';
import { createSessionStore } from '@/stores/session-store-context';
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
export type HistoryStoreApi = ReturnType<typeof createHistoryStore>;
export const HistoryStoreContext = createContext<HistoryStoreApi | null>(null);
export type DashboardStoreApi = ReturnType<typeof createDashboardStore>;
export const DashboardStoreContext = createContext<DashboardStoreApi | null>(null);
export type OrderStoreApi = ReturnType<typeof createOrderStore>;
export const OrderStoreContext = createContext<OrderStoreApi | null>(null);
export type SessionStoreApi = ReturnType<typeof createSessionStore>;
export const SessionStoreContext = createContext<SessionStoreApi | null>(null);
export type NotificationStoreApi = ReturnType<typeof createNotificationStore>;
export const NotificationStoreContext = createContext<NotificationStoreApi | null>(null);

export interface StoreProviderProps {
  children: ReactNode;
  shopSession?: Session | null;
  site?: Site | null;
  availableSites?: Site[];
}

export const StoreProvider = ({ children, shopSession, site, availableSites }: StoreProviderProps) => {
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
    siteStoreRef.current = createSiteStore({ site, availableSites, loading: false, error: null });
  }
  const shippingMethodsStoreRef = useRef<ShippingMethodsStoreApi | null>(null);
  if (shippingMethodsStoreRef.current === null) {
    shippingMethodsStoreRef.current = createShippingMethodsStore();
  }
  const customerStoreRef = useRef<CustomerStoreApi | null>(null);
  if (customerStoreRef.current === null) {
    customerStoreRef.current = createCustomerStore();
  }
  const historyStoreRef = useRef<HistoryStoreApi | null>(null);
  if (historyStoreRef.current === null) {
    historyStoreRef.current = createHistoryStore();
  }
  const dashboardStoreRef = useRef<DashboardStoreApi | null>(null);
  if (dashboardStoreRef.current === null) {
    dashboardStoreRef.current = createDashboardStore();
  }
  const orderStoreRef = useRef<OrderStoreApi | null>(null);
  if (orderStoreRef.current === null) {
    orderStoreRef.current = createOrderStore();
  }
  const sessionStoreRef = useRef<SessionStoreApi | null>(null);
  if (sessionStoreRef.current === null) {
    sessionStoreRef.current = createSessionStore({ session: shopSession, loading: false });
  }
  const notificationStoreRef = useRef<NotificationStoreApi | null>(null);
  if (notificationStoreRef.current === null) {
    notificationStoreRef.current = createNotificationStore();
  }
  /**
   * The order is relevant, because store data can only depend on one another,
   * when nested properly.
   * 1. Site Data is the root of all stores.
   * 2. Shipping Methods Data depends on Countries and Currency Data (from Site)
   * 3. Product Data depends on Currency and their Availability from Country (from Site)
   * 4. Customer Data depends on Currency for Customer-Preferences
   * 5. Order Data depends on Customer Data in logged in State
   * 6. Cart Data depends on Customer Data in logged in State
   * 7. Checkout Data depends on Cart Data.
   * 8. History Data may depend on various aspects of customer's Browsing Behaviour
   */
  return (
    <SiteStoreContext.Provider value={siteStoreRef.current}>
      <ShippingMethodsStoreContext.Provider value={shippingMethodsStoreRef.current}>
        <ProductStoreContext.Provider value={productStoreRef.current}>
          <CustomerStoreContext.Provider value={customerStoreRef.current}>
            <OrderStoreContext.Provider value={orderStoreRef.current}>
              <CartStoreContext.Provider value={cartStoreRef.current}>
                <CheckoutStoreContext.Provider value={checkoutStoreRef.current}>
                  <HistoryStoreContext.Provider value={historyStoreRef.current}>
                    <DashboardStoreContext.Provider value={dashboardStoreRef.current}>
                      <SessionStoreContext.Provider value={sessionStoreRef.current}>
                        <NotificationStoreContext.Provider value={notificationStoreRef.current}>
                          {children}
                        </NotificationStoreContext.Provider>
                      </SessionStoreContext.Provider>
                    </DashboardStoreContext.Provider>
                  </HistoryStoreContext.Provider>
                </CheckoutStoreContext.Provider>
              </CartStoreContext.Provider>
            </OrderStoreContext.Provider>
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

export const useHistoryStore = () => {
  const storeContext = useContext(HistoryStoreContext);
  if (!storeContext) {
    throw new Error('useHistoryStore must be used within StoreProvider');
  }
  return useStore(storeContext);
};

export const useDashboardStore = () => {
  const storeContext = useContext(DashboardStoreContext);
  if (!storeContext) {
    throw new Error('useDashboardStore must be used within StoreProvider');
  }
  return useStore(storeContext);
};

export const useOrderStore = () => {
  const storeContext = useContext(OrderStoreContext);
  if (!storeContext) {
    throw new Error('useOrderStore must be used within StoreProvider');
  }
  return useStore(storeContext);
};

export const useSessionStore = () => {
  const storeContext = useContext(SessionStoreContext);
  if (!storeContext) {
    throw new Error('useSessionStore must be used within StoreProvider');
  }
  return useStore(storeContext);
};

export const useNotificationStore = () => {
  const storeContext = useContext(NotificationStoreContext);
  if (!storeContext) {
    throw new Error('useNotificationStore must be used within StoreProvider');
  }
  return useStore(storeContext);
};
