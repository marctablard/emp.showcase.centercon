import { cache } from 'react';
import { CartService } from '@/platform/services/cart';
import { Cart } from '@/platform/services/model/cart/cart';
import { getCartIdFromCookie } from '../server/utils';

/**
 * Get the cart service instance from the platform container
 */
const getCartService = () => globalThis.EMP.platform.ssr.get<CartService>('CartService');

/**
 * Get the current cart by ID from cookie
 * This function is cached to prevent multiple cart fetches in a single request
 */
const getCartById = cache(async (cartId: string): Promise<Cart | null | undefined> => {
  try {
    const cart = await getCartService().getCartById(cartId);

    if (!cart) {
      throw new Error(`Cart not found with ID: ${cartId}`);
    }

    return cart;
  } catch (_error) {
    // on SSR we fail with undefined, so the Client can refetch if necessary
    return undefined;
  }
});

/**
 * Get the current cart
 * This should be used in server components to get the current cart
 */
export async function getCurrentCart(): Promise<Cart | null | undefined> {
  const cartId = await getCartIdFromCookie('main', 'EUR');
  if (!cartId) {
    return undefined;
  }

  return getCartById(cartId);
}
