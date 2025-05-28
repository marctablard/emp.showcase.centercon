'use client';

import { useState, useCallback, useEffect } from 'react';
// Import types only, we'll use fetch directly
// This ensures we're not accidentally importing server-side code
import type { 
  CheckoutRequest, 
  CheckoutResponse, 
  QuoteCheckoutRequest, 
  CheckoutAddress, 
  PaymentMethod, 
  Shipping, 
  Customer, 
  ContactData
} from '@/platform/services/model/checkout';
import { useCartStore, useCheckoutStore } from '@/providers/StoreProvider';
import { Cart } from '@/platform/services/model/cart/cart';

interface UseCheckout {
  // Status
  loading: boolean;
  error: Error | null;
  // Data
  checkoutCart: Cart | null;
  contactData: ContactData | null;
  billingAddress: CheckoutAddress | null;
  shippingAddress: CheckoutAddress | null;
  orderResponse: CheckoutResponse | null;
  shippingMethod: Shipping | null;
  paymentMethod: PaymentMethod | null;
  // Data submission
  submitContactData: (contactData: ContactData) => void;
  submitShippingAddress: (address: CheckoutAddress) => void;
  submitBillingAddress: (address: CheckoutAddress) => void;
  submitPaymentMethod: (method: PaymentMethod) => void;
  submitShippingMethod: (method: Shipping) => void;
  // Operations
  processCheckout: () => Promise<CheckoutResponse | null>;
  processQuoteCheckout: (quoteId: string, paymentMethod: PaymentMethod) => Promise<CheckoutResponse | null>;
  reset: () => void;
}



/**
 * Hook for processing checkout operations
 * 
 * @returns Checkout operations and state
 */
export const useCheckout = (): UseCheckout => {

  // Get checkout store data
  const { 
    contactData: storeContactData, 
    billingAddress: storeBillingAddress, 
    shippingAddress: storeShippingAddress, 
    paymentMethod: storePaymentMethod,
    shippingMethod: storeShippingMethod, 
    setCart, 
    setContactData: setStoreContactData,
    setBillingAddress: setStoreBillingAddress,
    setShippingAddress: setStoreShippingAddress,
    setPaymentMethod: setStorePaymentMethod,
    setShippingMethod: setStoreShippingMethod 
  } = useCheckoutStore();

  // Get cart from cart store
  const { currentCart: storeCart } = useCartStore();

  const [checkoutCart, setCheckoutCart] = useState<Cart | null>(storeCart);
  const [loading, setLoading] = useState<boolean>(false);
  const [contactData, setContactData] = useState<ContactData | null>(storeContactData);
  const [billingAddress, setBillingAddress] = useState<CheckoutAddress | null>(storeBillingAddress);
  const [shippingAddress, setShippingAddress] = useState<CheckoutAddress | null>(storeShippingAddress);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(storePaymentMethod);
  const [shippingMethod, setShippingMethod] = useState<Shipping | null>(storeShippingMethod);
  const [error, setError] = useState<Error | null>(null);
  const [orderResponse, setOrderResponse] = useState<CheckoutResponse | null>(null);
  
  

  // Store sync (propagates States to other hook-users)
  // Sync with cart store
  useEffect(() => {
    setCheckoutCart(storeCart);
    if (storeCart) {
      setCart(storeCart);
    }
  }, [storeCart, setCart]);
  
  // Sync with checkout store
  useEffect(() => {
    setContactData(storeContactData);
  }, [storeContactData]);

  useEffect(() => {
    setBillingAddress(storeBillingAddress);
  }, [storeBillingAddress]);

  useEffect(() => {
    setShippingAddress(storeShippingAddress);
  }, [storeShippingAddress]);
  
  useEffect(() => {
    setPaymentMethod(storePaymentMethod);
  }, [storePaymentMethod]);
  
  useEffect(() => {
    setShippingMethod(storeShippingMethod);
  }, [storeShippingMethod]);
  
  
  const submitContactData = useCallback((contactData: ContactData) => {
    // TODO validation!
    setStoreContactData(contactData);
  }, []);

  const submitShippingAddress = useCallback((address: CheckoutAddress) => {
    // TODO validation!
    setStoreShippingAddress(address);
  }, []);

  const submitBillingAddress = useCallback((address: CheckoutAddress) => {
    // TODO validation!
    setStoreBillingAddress(address);
  }, []);
  
  const submitPaymentMethod = useCallback((method: PaymentMethod) => {
    setStorePaymentMethod(method);
  }, [setStorePaymentMethod]);
  
  const submitShippingMethod = useCallback((method: Shipping) => {
    setStoreShippingMethod(method);
  }, [setStoreShippingMethod]);

  /**
   * Process a checkout for the current cart
   */
  const processCheckout = async (): Promise<CheckoutResponse | null> => {
    if (!checkoutCart) {
      setError(new Error('No cart available for checkout'));
      return null;
    }
    // TODO proper validation
    if (!shippingMethod || !billingAddress || !shippingAddress || !contactData || !paymentMethod) {
      setError(new Error('Missing required checkout data'));
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      // Use fetch directly to ensure client-side execution
      const checkoutData = {
        cartId: checkoutCart.id,
        shipping: shippingMethod,
        addresses: [billingAddress, shippingAddress],
        customer: contactData,
        paymentMethod: paymentMethod
      };
      
      const fetchResponse = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData),
      });
      
      if (!fetchResponse.ok) {
        const errorData = await fetchResponse.json();
        throw new Error(errorData.details || 'Failed to process checkout');
      }
      
      const response = await fetchResponse.json();
      setOrderResponse(response);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to process checkout');
      setError(error);
      console.error('Error processing checkout:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Process a checkout from a quote
   */
  const processQuoteCheckout = async (
    quoteId: string, 
    paymentMethod: PaymentMethod,
    deliveryWindowId?: string
  ): Promise<CheckoutResponse | null> => {
    try {
      setLoading(true);
      setError(null);

      throw new Error('Not implemented');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to process quote checkout');
      setError(error);
      console.error('Error processing quote checkout:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Reset the checkout state
   */
  const reset = () => {
    setError(null);
    setOrderResponse(null);
  }

  return {
    loading,
    error,
    checkoutCart,
    contactData,
    billingAddress,
    shippingAddress,
    shippingMethod,
    paymentMethod,
    orderResponse,
    submitContactData,
    submitShippingAddress,
    submitBillingAddress,
    submitPaymentMethod,
    submitShippingMethod,
    processCheckout,
    processQuoteCheckout,
    reset
  };
};
