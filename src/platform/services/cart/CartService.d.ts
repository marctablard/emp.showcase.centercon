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
  getCart(): Promise<Cart | undefined>;

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
  updateCartItemQuantity(cartId: string, itemId: string, quantity: number): Promise<void>;

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
}
