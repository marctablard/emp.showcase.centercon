'use client';

import { useEffect, useState } from 'react';
import { useCheckout } from '../checkout/useCheckout';
import { useCart } from './useCart';

interface UseCartTotal {
  cartTotal: number;
  shippingCosts?: number;
  currency: string;
}

export const useCartTotal = (): UseCartTotal => {
  const { shippingMethod } = useCheckout();
  const { cart } = useCart();
  const [cartTotal, setCartTotal] = useState(() => cart?.totalPrice?.amount || 0.0);

  useEffect(() => {
    let totalSum = 0.0;
    if (cart && cart.subTotalPrice.amount > 0.0) {
      totalSum += cart.subTotalPrice.amount;
      if (shippingMethod) {
        totalSum += shippingMethod.amount;
      }
    }
    setCartTotal(totalSum);
  }, [cart, shippingMethod]);

  return {
    cartTotal,
    shippingCosts: shippingMethod?.amount,
    currency: cart?.totalPrice.currency || 'EUR',
  };
};
