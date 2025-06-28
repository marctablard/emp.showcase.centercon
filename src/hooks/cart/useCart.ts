'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  addItemToCart as apiAddItemToCart,
  fetchCurrentCart as apiFetchCurrentCart,
  removeCartItem as apiRemoveCartItem,
  updateCartItemQuantity as apiUpdateCartItemQuantity,
  updateShippingInfo as apiUpdateShippingInfo,
} from '@/lib/client/carts';
import { Cart } from '@/platform/services/model/cart/cart';
import { useCartStore } from '@/providers/StoreProvider';
import { usePolling } from '../util/usePolling';

interface UseCart {
  // Cart data
  cart: Cart | null | undefined;
  cartId: string | null;
  totalItems: number;

  // Status
  loading: boolean;
  error: Error | null;

  // Operations
  addItem: (productId: string, quantity: number) => Promise<void>;
  updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateShippingInfo: (countryCode?: string, zipCode?: string) => Promise<void>;
  clearCart: () => void;

  // Utility
  refetch: () => Promise<void>;
}

/**
 * Hook for interacting with the shopping cart
 *
 * @param initialCart Optional initial cart state
 * @returns Cart data and operations
 */
export const useCart = (initialCart?: Cart | null): UseCart => {
  const {
    setCurrentCart: setStoreCart,
    getCurrentCart: getStoreCart,
    getLoading,
    setLoading,
    loading,
    currentCart: cart,
  } = useCartStore();
  if (getStoreCart() === undefined && initialCart !== undefined) {
    setStoreCart(initialCart);
  }

  const [error, setError] = useState<Error | null>(null);
  const [lastModification, setLastModification] = useState<Date | null>(null);

  const fetchCart = useCallback(
    async (createCurrent?: boolean) => {
      try {
        setLoading(true);
        setError(null);

        // Try to fetch existing cart
        try {
          const cartData = await apiFetchCurrentCart(createCurrent);
          setStoreCart(cartData);
          return cartData;
        } catch (_err) {
          // TODO clarify error handling when cart is gone
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch cart'));
        setStoreCart(undefined);
        console.error('Error fetching cart:', err);
      } finally {
        setLoading(false);
      }
    },
    [setStoreCart, setLoading],
  );

  const { start: startPolling, stop: stopPolling } = usePolling(() => {
    fetchCart();
  }, 10000);

  /**
   * Add an item to the cart
   */
  const addItem = useCallback(
    async (productId: string, quantity: number) => {
      setLoading(true);
      setError(null);

      try {
        let addCartId;
        if (!cart) {
          const newCart = await fetchCart(true);
          if (newCart) {
            addCartId = newCart.id;
          } else {
            throw new Error('No cart available');
          }
        } else {
          addCartId = cart.id;
        }

        // Call API to add item
        await apiAddItemToCart(addCartId, productId, quantity);
        setLastModification(new Date());
        startPolling();
        // Refetch cart to get updated state
        await fetchCart();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to add item to cart'));
        console.error('Error adding item to cart:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [cart, setLoading, fetchCart, startPolling],
  );

  /**
   * Update the quantity of an item in the cart
   */
  const updateItemQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (!cart) {
        await fetchCart();
        if (!cart) throw new Error('No cart available');
      }

      try {
        setLoading(true);
        setError(null);

        // Call API to update item
        await apiUpdateCartItemQuantity(cart.id, itemId, quantity);
        setLastModification(new Date());
        startPolling();
        // Refetch cart to get updated state
        await fetchCart();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update cart item'));
        console.error('Error updating cart item:', err);
      } finally {
        setLoading(false);
      }
    },
    [cart, fetchCart, setLoading, startPolling],
  );

  /**
   * Remove an item from the cart
   */
  const removeItem = useCallback(
    async (itemId: string) => {
      if (!cart) {
        await fetchCart();
        if (!cart) throw new Error('No cart available');
      }

      try {
        setLoading(true);
        setError(null);

        // Call API to remove item
        await apiRemoveCartItem(cart.id, itemId);
        setLastModification(new Date());
        startPolling();
        // Refetch cart to get updated state
        await fetchCart();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to remove cart item'));
        console.error('Error removing cart item:', err);
      } finally {
        setLoading(false);
      }
    },
    [cart, fetchCart, setLoading, startPolling],
  );

  /**
   * Update shipping info
   */
  const updateShippingInfo = useCallback(
    async (countryCode?: string, zipCode?: string) => {
      try {
        setLoading(true);
        setError(null);
        if (!cart) {
          await fetchCart();
          if (!cart) return;
        }
        // Call API to update shipping info
        await apiUpdateShippingInfo(cart.id, countryCode, zipCode);
        // Refetch cart to get updated state
        await fetchCart();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update shipping info'));
        console.error('Error updating shipping info:', err);
      } finally {
        setLoading(false);
      }
    },
    [cart, fetchCart, setLoading],
  );

  const clearCart = useCallback(() => {
    setStoreCart(undefined);
  }, [setStoreCart]);

  // Initialize cart on first render if not already initialized
  useEffect(() => {
    if (cart === undefined && !getLoading()) {
      setLoading(true);
      // first try to grab the cart from the store
      const currentCart = getStoreCart();
      if (currentCart !== undefined) {
        setLoading(false);
        return;
      }
      // Otherwise fetch current cart
      fetchCart();
    }
  }, [cart, getStoreCart, fetchCart, getLoading, setLoading]);

  useEffect(() => {
    if (cart && lastModification) {
      if (cart.processUpdate?.updatedAt) {
        const updatedAt = new Date(cart.processUpdate.updatedAt);
        if (updatedAt.getTime() > lastModification.getTime()) {
          stopPolling();
        }
      }
    }
  }, [cart, lastModification, stopPolling]);

  return {
    cart,
    cartId: cart?.id || null,
    totalItems: cart?.items.reduce((total, item) => total + item.quantity, 0) || 0,
    loading,
    error,
    addItem,
    updateItemQuantity,
    removeItem,
    updateShippingInfo,
    clearCart,
    refetch: async () => {
      await fetchCart(false);
      return;
    },
  };
};
