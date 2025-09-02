import { cache } from 'react';
import { CartService } from '@/platform/services/cart';
import { Cart } from '@/platform/services/model/cart/cart';
import { getSession } from './session';

/**
 * Get the cart service instance from the platform container
 */
const getCartService = () => globalThis.EMP.platform.ssr.get<CartService>('CartService');

/**
 * Get the current cart by criteria from cookie
 * This function is cached to prevent multiple cart fetches in a single request
 */
const getCartByCriteria = cache(
  async (siteCode: string, sessionId: string, customerId?: string): Promise<Cart | null | undefined> => {
    try {
      const cart = await getCartService().getCartByCriteria(siteCode, sessionId, customerId);
      return cart;
    } catch (_error) {
      // on SSR we fail with undefined, so the Client can refetch if necessary
      return undefined;
    }
  },
);

const getCart = cache(async (): Promise<Cart | null | undefined> => {
  try {
    const cart = await getCartService().getCart();
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
  const session = await getSession();
  if (!session) {
    return undefined;
  }

  // If we have a session but no cartId or customerId, use the default getCart method
  if (!session.cartId && !session.customerId) {
    return getCart();
  }

  // For anonymous users, use cartId; for authenticated users, use customerId
  const siteCode = session.siteCode || 'main';
  const sessionId = session.id || '';
  const customerId = session.customerId !== 'ANONYMOUS' ? session.customerId : undefined;

  return getCartByCriteria(siteCode, sessionId, customerId);
}
