import { AddCartItemRequest, CreateCartRequest, EmporixCart, UpdateCartItemRequest } from '../model';

/**
 * Interface for Cart API operations
 */
export interface CartApi {
  /**
   * Create a new cart
   * @param createCartRequest Cart creation request
   * @returns Promise with the created cart ID
   */
  createCart(createCartRequest: CreateCartRequest): Promise<string>;

  /**
   * Get cart by ID
   * @param cartId Cart ID
   * @returns Promise with the cart details
   */
  getCart(cartId: string): Promise<EmporixCart | null>;

  /**
   * Get cart by criteria (sessionId, customerId, siteCode)
   * @param siteCode Site code
   * @param sessionId Optional session ID for anonymous customers
   * @param customerId Optional customer ID for logged-in customers
   * @param type Optional cart type (e.g., "shopping")
   * @returns Promise with the cart details
   */
  getCartByCriteria(
    siteCode: string,
    sessionId?: string,
    customerId?: string,
    type?: string,
  ): Promise<EmporixCart | undefined>;

  /**
   * Add item to cart
   * @param cartId Cart ID
   * @param item Item to add
   * @returns Promise with the created item ID
   */
  addItemToCart(cartId: string, item: AddCartItemRequest): Promise<string>;

  /**
   * Get all items in a cart
   * @param cartId Cart ID
   * @returns Promise with array of cart items
   */
  getCartItems(cartId: string): Promise<CartItem[]>;

  /**
   * Update cart item
   * @param cartId Cart ID
   * @param itemId Item ID
   * @param updateRequest Update request with quantity and optional price information
   * @returns Promise resolving when update is complete
   */
  updateCartItemQuantity(cartId: string, itemId: string, updateRequest: UpdateCartItemRequest): Promise<void>;

  /**
   * Remove item from cart
   * @param cartId Cart ID
   * @param itemId Item ID
   * @returns Promise resolving when removal is complete
   */
  removeCartItem(cartId: string, itemId: string): Promise<void>;

  /**
   * Delete a cart
   * @param cartId Cart ID
   * @returns Promise resolving when deletion is complete
   */
  deleteCart(cartId: string): Promise<void>;

  /**
   * Update cart
   * @param cartId Cart ID
   * @param cart Partial cart to update
   * @returns Promise resolving when update is complete
   */
  updateCart(cartId: string, cart: Partial<EmporixCart>): Promise<void>;
}
