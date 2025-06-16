import z from 'zod';
import { CheckoutRequest, QuoteCheckoutRequest } from '../../model/checkout';
import { ValidationResult } from '../../validation';

/**
 * Checkout step types
 */
export type CheckoutStep = 'customer' | 'addresses' | 'shipping' | 'payment';

/**
 * Interface for checkout validation service
 */
export interface CheckoutValidator {
  /**
   * Validate the complete checkout request
   * @param request The checkout request to validate
   * @returns Validation result with success flag and errors if any
   */
  validateCheckoutRequest(request: CheckoutRequest): ValidationResult<CheckoutRequest>;

  /**
   * Validate the complete checkout request
   * @param request The checkout request to validate
   * @returns Validation result with success flag and errors if any
   */
  validateGuestCheckoutRequest(request: CheckoutRequest): ValidationResult<CheckoutRequest>;

  /**
   * Validate a quote checkout request
   * @param request The quote checkout request to validate
   * @returns Validation result with success flag and errors if any
   */
  validateQuoteCheckoutRequest(request: QuoteCheckoutRequest): ValidationResult<QuoteCheckoutRequest>;
}
