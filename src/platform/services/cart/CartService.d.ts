import type { Cart } from '../model/cart/cart';

/**
 * Interface for cart service.
 * Defines methods for cart operations.
 */
export interface CartService {
  /**
   * Creates a new cart
   * @param currency Currency code for the cart
   * @param siteCode Site code for the cart
   * @returns The ID of the created cart
   */
  createCart(currency: string, siteCode: string): Promise<string>;

  /**
   * Retrieves the current Sessions Cart.
   * @returns The cart if found, otherwise undefined.
   */
  getCart(): Promise<Cart | null>;

  /**
   * Retrieves a cart by its ID.
   * @param id The ID of the cart to retrieve.
   * @returns The cart if found, otherwise undefined.
   */
  getCartById(id: string): Promise<Cart | null>;

  /**
   * Adds an item to a cart
   * @param cartId The ID of the cart
   * @param productId The ID of the product to add
   * @param quantity The quantity to add
   * @returns The ID of the added item
   */
  addItemToCart(cartId: string, productId: string, quantity: number): Promise<string>;

  /**
   * Updates the quantity of an item in the cart
   * @param cartId The ID of the cart
   * @param itemId The ID of the item to update
   * @param quantity The new quantity
   */
  updateCartItemQuantity(cartId: string, itemId: string, quantity: number): Promise<CartItem>;

  /**
   * Removes an item from the cart
   * @param cartId The ID of the cart
   * @param itemId The ID of the item to remove
   */
  removeCartItem(cartId: string, itemId: string): Promise<void>;

  /**
   * Deletes a cart
   * @param cartId The ID of the cart to delete
   */
  deleteCart(cartId: string): Promise<void>;

  /**
   * Updates the shipping information for a cart
   * @param cartId The ID of the cart
   * @param countryCode The country code for the shipping address
   * @param zipCode The zip code for the shipping address
   */
  updateShippingInfo(cartId: string, countryCode?: string, zipCode?: string): Promise<void>;

  /**
   * Updates the currency for a cart
   * @param cartId The ID of the cart
   * @param currency The new currency code
   */
  updateCurrency(cartId: string, currency: string): Promise<void>;

  /**
   * Updates the site for a cart
   * @param cartId The ID of the cart
   * @param siteCode The new site code
   */
  updateSite(cartId: string, siteCode: string): Promise<void>;

  /**
   * Get cart by criteria (siteCode, sessionId, customerId, type)
   * Useful for retrieving carts when you don't have the cart ID but have other identifiers
   *
   * @param siteCode - The site code to filter by
   * @param sessionId - The session ID to filter by
   * @param customerId - The customer ID to filter by
   * @param type - The cart type to filter by (e.g., 'shopping')
   * @returns The mapped cart or null if not found
   */
  getCartByCriteria(siteCode: string, sessionId: string, customerId?: string, type?: string): Promise<Cart | null>;
}
