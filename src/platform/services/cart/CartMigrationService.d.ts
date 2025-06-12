import type { Cart } from '../model/cart/cart';

/**
 * Interface for handling Cart Migration Operations
 */
export interface CartMigrationService {
  migrateSessionCartToCurrentCustomer(): Promise<string | null>;

  /**
   * Migrates a cart to the current customer
   * @param cartId The ID of the cart to migrate
   * @returns Promise that resolves when the cart is migrated
   */
  migrateCartToCustomer(cartId: string, customerId: string): Promise<void>;

  /**
   * Merges two carts into one
   * @param sourceCartId The ID of the source cart
   * @param targetCartId The ID of the target cart
   * @returns Promise that resolves when the carts are merged
   */
  mergeCarts(sourceCartId: string, targetCartId: string): Promise<Cart>;
}
