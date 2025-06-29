'use client';

import { useCallback, useEffect, useState } from 'react';
import { checkout } from '@/lib/client/checkout';
import { Cart } from '@/platform/services/model/cart/cart';
import type {
  CheckoutAddress,
  CheckoutPaymentMethod,
  CheckoutResponse,
  CheckoutShipping,
  ContactData,
} from '@/platform/services/model/checkout';
import { ShippingMethod } from '@/platform/services/model/shipping';
import { useCheckoutStore } from '@/providers/StoreProvider';
import { useCart } from '../cart/useCart';
import { useAddresses } from '../customer/useAddresses';
import useCustomer from '../customer/useCustomer';
import { useShippingMethods } from '../shipping/useShippingMethods';

interface UseCheckout {
  // Status
  loading: boolean;
  error: Error | null;
  // Data
  checkoutCart: Cart | null | undefined;
  contactData: ContactData | null;
  billingAddress: CheckoutAddress | null;
  shippingAddress: CheckoutAddress | null;
  orderResponse: CheckoutResponse | null;
  shippingMethod: CheckoutShipping | null;
  paymentMethod: CheckoutPaymentMethod | null;
  availableShippingMethods: ShippingMethod[];
  shippingMethodsLoading: boolean;
  // Data submission
  submitContactData: (contactData: ContactData) => void;
  submitShippingAddress: (address: CheckoutAddress) => void;
  submitBillingAddress: (address: CheckoutAddress) => void;
  submitPaymentMethod: (method: CheckoutPaymentMethod) => void;
  submitShippingMethod: (method: ShippingMethod) => void;
  // Operations
  processCheckout: () => Promise<CheckoutResponse | null>;
  processQuoteCheckout: (quoteId: string, paymentMethod: CheckoutPaymentMethod) => Promise<CheckoutResponse | null>;
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
    contactData,
    billingAddress,
    shippingAddress,
    paymentMethod,
    shippingMethod,

    setContactData,
    setBillingAddress,
    setShippingAddress,
    setPaymentMethod,
    setShippingMethod,
  } = useCheckoutStore();

  // Get cart from cart store
  const { cart: checkoutCart, updateShippingInfo, clearCart } = useCart();
  const { customer } = useCustomer();
  const { getDefaultAddress, loading: addressesLoading } = useAddresses();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [orderResponse, setOrderResponse] = useState<CheckoutResponse | null>(null);
  const {
    shippingMethods: availableShippingMethods,
    clearShippingMethods,
    fetchShippingMethods,
    loading: shippingMethodsLoading,
  } = useShippingMethods();

  const submitContactData = useCallback(
    (contactData: ContactData) => {
      // TODO validation!
      setContactData(contactData);
    },
    [setContactData],
  );

  const submitShippingAddress = useCallback(
    (address: CheckoutAddress) => {
      // TODO validation!
      if (
        checkoutCart &&
        (address.country != shippingAddress?.country || address.zipCode != shippingAddress?.zipCode)
      ) {
        updateShippingInfo(address.country, address.zipCode);
      }
      setShippingAddress(address);
    },
    [checkoutCart, shippingAddress, setShippingAddress, updateShippingInfo],
  );

  const submitBillingAddress = useCallback(
    (address: CheckoutAddress) => {
      // TODO validation!
      setBillingAddress(address);
    },
    [setBillingAddress],
  );

  const submitPaymentMethod = useCallback(
    (method: CheckoutPaymentMethod) => {
      setPaymentMethod(method);
    },
    [setPaymentMethod],
  );

  const submitShippingMethod = useCallback(
    (method: ShippingMethod) => {
      setShippingMethod({
        methodId: method.id,
        zoneId: method.zoneId,
        methodName: method.name,
        amount: method.cost?.amount || 0,
      });
    },
    [setShippingMethod],
  );

  /**
   * Process a checkout for the current cart
   */
  const processCheckout = async (): Promise<CheckoutResponse | null> => {
    if (!checkoutCart) {
      setError(new Error('No cart available for checkout'));
      return null;
    }
    // Validate each required checkout component individually
    if (!shippingMethod) {
      setError(new Error('Missing shipping method'));
      return null;
    }

    if (!billingAddress) {
      setError(new Error('Missing billing address'));
      return null;
    }

    if (!shippingAddress) {
      setError(new Error('Missing shipping address'));
      return null;
    }

    if (!customer && !contactData) {
      setError(new Error('Missing contact information'));
      return null;
    }

    if (!paymentMethod) {
      setError(new Error('Missing payment method'));
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const checkoutData = {
        cartId: checkoutCart.id,
        shipping: shippingMethod,
        addresses: [billingAddress, shippingAddress],
        customer: contactData,
        paymentMethod: paymentMethod,
        summary: {
          termsAndConditions: true,
        },
      };

      const checkoutResponse = await checkout(checkoutData);

      if (!checkoutResponse) {
        throw new Error('Failed to process checkout');
      }

      clearCart();
      setShippingMethod(null);
      setPaymentMethod(null);
      setShippingAddress(null);
      setBillingAddress(null);
      setOrderResponse(checkoutResponse);
      return checkoutResponse;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to process checkout');
      setError(error);
      console.error('Error processing checkout:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Process a checkout from a quote
   */
  const processQuoteCheckout = async (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    quoteId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    paymentMethod: CheckoutPaymentMethod,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    deliveryWindowId?: string,
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
  };

  /**
   * Reset the checkout state
   */
  const reset = () => {
    setError(null);
    setOrderResponse(null);
  };

  useEffect(() => {
    if (checkoutCart && shippingAddress) {
      if (shippingAddress.country && shippingAddress.zipCode) {
        fetchShippingMethods(shippingAddress.country, shippingAddress.zipCode, checkoutCart.totalPrice);
      }
    } else {
      clearShippingMethods();
    }
  }, [shippingAddress, checkoutCart, fetchShippingMethods, clearShippingMethods]);

  useEffect(() => {
    if (!addressesLoading) {
      if (!shippingAddress) {
        const defaultShippingAddress = getDefaultAddress('SHIPPING');
        if (defaultShippingAddress) {
          submitShippingAddress({
            ...defaultShippingAddress,
            type: 'SHIPPING',
          });
        }
      }
      if (!billingAddress) {
        const defaultBillingAddress = getDefaultAddress('BILLING');
        if (defaultBillingAddress) {
          submitBillingAddress({
            ...defaultBillingAddress,
            type: 'BILLING',
          });
        }
      }
      setLoading(false);
    }
  }, [
    addressesLoading,
    shippingAddress,
    billingAddress,
    getDefaultAddress,
    submitBillingAddress,
    submitShippingAddress,
    setLoading,
  ]);

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
    availableShippingMethods,
    shippingMethodsLoading,
    submitContactData,
    submitShippingAddress,
    submitBillingAddress,
    submitPaymentMethod,
    submitShippingMethod,
    processCheckout,
    processQuoteCheckout,
    reset,
  };
};
