/**
 * Service layer model definitions for checkout
 */
import { Address, AddressType } from '@/platform/services/model/common';
import { PaymentMode } from '@/platform/services/model/payment';

/**
 * Common properties for all checkout requests
 */
export interface BaseCheckoutRequest {
  customer: ContactData;
  paymentMethod: CheckoutPaymentMethod;
  currency?: string;
}

export interface ContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
}

export interface CheckoutAddress extends Address {
  type: AddressType; // Required for Checkout
}

/**
 * Customer information for checkout
 */
export interface ContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
}

/**
 * Payment method for checkout
 */
export interface CheckoutPaymentMethod extends PaymentMode {
  amount?: number;
  customAttributes?: Record<string, any>;
}

/**
 * Shipping information for checkout
 */
export interface CheckoutShipping {
  methodId: string;
  zoneId: string;
  methodName: string;
  amount: number;
  taxCode?: string;
}

/**
 * Checkout request model for cart checkout
 */
export interface CheckoutRequest extends BaseCheckoutRequest {
  cartId: string;
  shipping: CheckoutShipping;
  addresses: CheckoutAddress[];
  customer: ContactData | null;
  paymentMethod: CheckoutPaymentMethod;
}

/**
 * Checkout response model
 */
export interface CheckoutResponse {
  orderId: string;
  paymentDetails?: any;
}

/**
 * Quote checkout request model
 */
export interface QuoteCheckoutRequest extends BaseCheckoutRequest {
  quoteId: string;
}
