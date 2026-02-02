'use client';

import { useEffect } from 'react';
import { useSession as useAppSession } from '@/hooks/session/useSession';
import { ModifyCartItemResult } from '@/platform/services/cart/CartService';
import { Cart } from '@/platform/services/model/cart/cart';
import { useCartStore, useSessionStore } from '@/providers/StoreProvider';

// Module-level lock to prevent duplicate currency updates across all useCart instances
let globalCurrencyUpdateInProgress = false;

interface UseCart {
  // Cart data
  cart: Cart | null | undefined;
  cartId: string | null;
  totalItems: number;

  // Status
  loading: boolean;
  error: Error | null;

  // Operations
  addItem: (productId: string, quantity: number) => Promise<ModifyCartItemResult>;
  updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateShippingInfo: (countryCode?: string, zipCode?: string) => Promise<void>;
  clearCart: () => void;
  loadCart: (cartId: string, type?: string) => Promise<Cart | null | undefined>;

  // Utility
  refetch: () => Promise<void>;
}

/**
 * Hook for interacting with the shopping cart
 * This is now a simple pass-through to the cart store
 *
 * @param initialCart Optional initial cart state
 * @returns Cart data and operations
 */
export const useCart = (initialCart?: Cart | null): UseCart => {
  const {
    currentCart: cart,
    loading,
    error,
    addToCart,
    updateItemQuantity,
    removeItem,
    updateShippingInfo,
    updateCurrency,
    clearCart,
    fetchCart,
    setCurrentCart,
    loadCart,
    validateSite,
  } = useCartStore();

  const { session } = useSessionStore();

  useEffect(() => {
    if (!cart) {
      // Initialize with initialCart if provided and cart is undefined
      if (initialCart !== undefined) {
        setCurrentCart(initialCart);
      } else {
        fetchCart(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, initialCart]);

  // Validate cart when site changes
  useEffect(() => {
    if (session?.siteCode) {
      validateSite(session.siteCode);
    }
  }, [session?.siteCode, validateSite]);

  const { session: appSession } = useAppSession();
  useEffect(() => {
    // Prevent duplicate calls while update is in progress (global lock across all useCart instances)
    if (globalCurrencyUpdateInProgress) {
      return;
    }

    if (!cart || !appSession?.currency || !appSession?.siteCode) {
      return;
    }

    // Don't update currency if cart belongs to a different site (stale cart during site switch)
    if (cart.site !== appSession.siteCode) {
      return;
    }

    const cartCurrency = cart.currency || cart.totalPrice?.currency;
    if (cartCurrency && cartCurrency !== appSession.currency) {
      globalCurrencyUpdateInProgress = true;
      updateCurrency(appSession.currency).finally(() => {
        globalCurrencyUpdateInProgress = false;
      });
    }
  }, [appSession?.currency, appSession?.siteCode, cart, updateCurrency]);

  return {
    cart,
    cartId: cart?.id || null,
    totalItems: cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0,
    loading,
    error,
    // Map store functions to the expected hook interface
    addItem: addToCart,
    updateItemQuantity,
    removeItem,
    updateShippingInfo,
    clearCart,
    refetch: async () => {
      await fetchCart(false);
    },
    loadCart,
  };
};
