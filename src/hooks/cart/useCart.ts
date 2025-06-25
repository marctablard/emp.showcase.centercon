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
import { CartDeliveryData } from '@/platform/services/validation/impl/EmporixCartDeliveryValidationService';
import { useCartStore } from '@/providers/StoreProvider';

interface CartMethodResult {
  success: boolean;
  error?: string;
  method?: string;
}
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
  updateDeliveryMethod: (contactData: CartDeliveryData) => Promise<CartMethodResult>;
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
    currentCart: storeCart,
  } = useCartStore();
  if (getStoreCart() === undefined && initialCart !== undefined) {
    setStoreCart(initialCart);
  }
  const [error, setError] = useState<Error | null>(null);
  // we do this, so that the invokers of this hook can immediately use the cart
  const [cart, setCart] = useState<Cart | null | undefined>(getStoreCart());

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

  // Initialize cart on first render if not already initialized
  useEffect(() => {
    if (cart === undefined && !getLoading()) {
      setLoading(true);
      // first try to grab the cart from the store
      const currentCart = getStoreCart();
      if (currentCart !== undefined) {
        setCart(currentCart);
        setLoading(false);
        return;
      }
      // Otherwise fetch current cart
      fetchCart();
    }
  }, [cart, getStoreCart, fetchCart, getLoading, setLoading]);

  useEffect(() => {
    // listen to changes on storeCart to update local state
    // this reflects changes to the store into all components
    // that use the Hook
    if (storeCart !== cart) {
      setCart(storeCart);
    }
  }, [storeCart, cart]);

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
    [cart, setLoading, fetchCart],
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
    [cart, fetchCart, setLoading],
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
    [cart, fetchCart, setLoading],
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
    [cart, fetchCart, setLoading],
  );

  const updateDeliveryMethod = async (): Promise<CartMethodResult> => {
    setLoading(true);
    setError(null);

    try {
      const method = 'delivery';
      setLoading(false);

      return {
        success: true,
        method: method,
      };
    } catch (error) {
      setLoading(false);
      setError(error instanceof Error ? error : new Error('Failed switch delivery method'));

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed switch delivery method',
      };
    }
  };

  const clearCart = useCallback(() => {
    setStoreCart(undefined);
    setCart(undefined);
  }, [setStoreCart]);

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
    updateDeliveryMethod,
    clearCart,
    refetch: async () => {
      await fetchCart(false);
      return;
    },
  };
};
