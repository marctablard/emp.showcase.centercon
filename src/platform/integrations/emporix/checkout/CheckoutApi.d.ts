import { EmporixCartCheckoutRequest, EmporixCheckoutResponse, EmporixQuoteCheckoutRequest } from "../model/checkout";

/**
 * Interface for Checkout API operations
 */
export interface CheckoutApi {
  /**
   * Trigger a checkout for a given cart
   * @param request Checkout request with cart details
   * @returns Promise with the order ID
   */
  checkout(request: EmporixCartCheckoutRequest): Promise<EmporixCheckoutResponse>;

  /**
   * Trigger a checkout for a guest user
   * @param request Guest checkout request
   * @returns Promise with the order ID
   */
  guestCheckout(request: EmporixCartCheckoutRequest): Promise<EmporixCheckoutResponse>;

  /**
   * Trigger a checkout from a quote
   * @param request Checkout from quote request
   * @returns Promise with the order ID
   */
  checkoutFromQuote(request: EmporixQuoteCheckoutRequest): Promise<EmporixCheckoutResponse>;
}
