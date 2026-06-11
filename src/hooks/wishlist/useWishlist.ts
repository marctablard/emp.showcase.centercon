'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { notifyWishlistAdded } from '@/components/wishlist/wishlist-added-notification';
import type { MoveWishlistItemToCartResult } from '@/lib/client/wishlist';
import type { Wishlist } from '@/platform/services/model/wishlist/wishlist';
import { useCartStore, useWishlistStore } from '@/providers/StoreProvider';

interface UseWishlist {
  wishlist: Wishlist | null | undefined;
  totalQuantity: number;
  loading: boolean;
  error: Error | null;
  addItem: (productId: string, quantity: number) => Promise<Wishlist>;
  updateItemQuantity: (productId: string, quantity: number) => Promise<Wishlist>;
  removeItem: (productId: string) => Promise<Wishlist | null>;
  moveItemToCart: (productId: string) => Promise<MoveWishlistItemToCartResult>;
  refetch: () => Promise<void>;
}

/**
 * Reads + mutates the customer's wishlist. Auto-fetches on mount, clears on logout, refetches
 * on login.
 */
export const useWishlist = (): UseWishlist => {
  const {
    currentWishlist,
    loading,
    error,
    addItem,
    updateItemQuantity,
    removeItem,
    moveItemToCart,
    fetchWishlist,
    clearWishlist,
  } = useWishlistStore();
  const { setCurrentCart } = useCartStore();

  const addItemAndNotify = async (productId: string, quantity: number): Promise<Wishlist> => {
    const wishlist = await addItem(productId, quantity);
    const addedItem = wishlist.items.find((i) => i.productId === productId);

    if (addedItem) {
      notifyWishlistAdded(addedItem, quantity);
    }

    return wishlist;
  };

  const moveItemToCartAndSyncCart = async (productId: string): Promise<MoveWishlistItemToCartResult> => {
    const result = await moveItemToCart(productId);
    setCurrentCart(result.cart);
    return result;
  };

  useEffect(() => {
    if (currentWishlist === undefined) {
      fetchWishlist();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWishlist]);

  const { status: sessionStatus } = useSession();
  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      clearWishlist();
    } else if (sessionStatus === 'authenticated') {
      fetchWishlist();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionStatus]);

  return {
    wishlist: currentWishlist,
    totalQuantity: currentWishlist?.totalQuantity ?? 0,
    loading,
    error,
    addItem: addItemAndNotify,
    updateItemQuantity,
    removeItem,
    moveItemToCart: moveItemToCartAndSyncCart,
    refetch: async () => {
      await fetchWishlist();
    },
  };
};
