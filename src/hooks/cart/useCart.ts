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
  const { setCurrentCart, getCurrentCart, currentCart: storeCart } = useCartStore();
  // Local state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  // Local cart state, either set, or null (no cart available) or undefined (unknown)
  const [cart, setCart] = useState<Cart | null | undefined>(initialCart);

  /**
   * Fetch the current cart
   */
  const fetchCart = useCallback(
    async (createCurrent?: boolean) => {
      try {
        setLoading(true);
        setError(null);

        // Try to fetch existing cart
        try {
          const cartData = await apiFetchCurrentCart(createCurrent);
          setCurrentCart(cartData);
          return cartData;
        } catch (_err) {
          // TODO clarify error handling when cart is gone
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch cart'));
        setCurrentCart(undefined);
        console.error('Error fetching cart:', err);
      } finally {
        setLoading(false);
      }
    },
    [setCurrentCart],
  );

  // Initialize cart on first render if not already initialized
  useEffect(() => {
    if (cart === undefined && !loading) {
      setLoading(true);
      // first try to grab the cart from the store
      const storeCart = getCurrentCart();
      if (storeCart !== undefined) {
        setCart(storeCart);
        setLoading(false);
        return;
      }
      // Otherwise fetch current cart
      fetchCart();
    }
  }, [cart, fetchCart, getCurrentCart, loading]);

  useEffect(() => {
    // listen to changes on storeCart to update local state
    // this reflects changes to the store into all components
    // that use the Hook
    setCart(storeCart);
  }, [storeCart]);

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

        // Refetch cart to get updated state
        await fetchCart();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to add item to cart'));
        console.error('Error adding item to cart:', err);
      } finally {
        setLoading(false);
      }
    },
    [cart, fetchCart],
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

        // Refetch cart to get updated state
        await fetchCart();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update cart item'));
        console.error('Error updating cart item:', err);
      } finally {
        setLoading(false);
      }
    },
    [cart, fetchCart],
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

        // Refetch cart to get updated state
        await fetchCart();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to remove cart item'));
        console.error('Error removing cart item:', err);
      } finally {
        setLoading(false);
      }
    },
    [cart, fetchCart],
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
          if (!cart) throw new Error('No cart available');
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
    [cart, fetchCart],
  );

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
    refetch: async () => {
      await fetchCart(false);
      return;
    },
  };
};
