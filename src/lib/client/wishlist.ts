import type { CartStatus, CartStatusDetailCode } from '@/platform/services/cart/CartService';
import type { Cart } from '@/platform/services/model/cart/cart';
import type { Wishlist } from '@/platform/services/model/wishlist/wishlist';

export interface MoveWishlistItemToCartResult {
  wishlist: Wishlist | null;
  cart: Cart;
  partialFailure?: 'wishlist-remove-failed';
  /** Cart-side add status — propagated from CartService so the UI can show stock warnings. */
  status: CartStatus;
  statusDetailCode?: CartStatusDetailCode;
  statusDetailPayload?: { availableQuantity?: number } & Record<string, unknown>;
}

/**
 * Fetch the authenticated customer's default wishlist.
 */
export async function fetchCurrentWishlist(): Promise<Wishlist | null> {
  const response = await fetch('/api/wishlist');
  if (response.status === 204 || response.status === 401) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch wishlist: ${response.statusText}`);
  }
  return (await response.json()) as Wishlist;
}

/**
 * Add a product to the wishlist (lazy-creates the wishlist on first add).
 * Returns the updated wishlist on success.
 */
export async function addItemToWishlist(productId: string, quantity: number): Promise<Wishlist> {
  const response = await fetch('/api/wishlist/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantity }),
  });
  if (!response.ok) {
    throw new Error(`Failed to add item to wishlist: ${response.statusText}`);
  }
  return (await response.json()) as Wishlist;
}

/** Update the quantity of a wishlist line. */
export async function updateWishlistItemQuantity(productId: string, quantity: number): Promise<Wishlist> {
  const response = await fetch(`/api/wishlist/items/${encodeURIComponent(productId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity }),
  });
  if (!response.ok) {
    throw new Error(`Failed to update wishlist item: ${response.statusText}`);
  }
  return (await response.json()) as Wishlist;
}

/** Remove an item from the wishlist. Returns `null` when the wishlist becomes empty (auto-deleted). */
export async function removeWishlistItem(productId: string): Promise<Wishlist | null> {
  const response = await fetch(`/api/wishlist/items/${encodeURIComponent(productId)}`, { method: 'DELETE' });
  if (response.status === 204) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Failed to remove wishlist item: ${response.statusText}`);
  }
  return (await response.json()) as Wishlist;
}

/** Move a wishlist item to the shopping cart. */
export async function moveWishlistItemToCart(productId: string): Promise<MoveWishlistItemToCartResult> {
  const response = await fetch(`/api/wishlist/items/${encodeURIComponent(productId)}/cart`, { method: 'POST' });
  if (!response.ok) {
    throw new Error(`Failed to move wishlist item to cart: ${response.statusText}`);
  }
  return (await response.json()) as MoveWishlistItemToCartResult;
}
