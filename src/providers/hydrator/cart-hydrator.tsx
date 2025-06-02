'use client';

import { useEffect } from 'react';
import { Cart } from '@/platform/services/model/cart/cart';
import { useCartStore } from '@/providers/StoreProvider';

export interface CartHydratorProps {
  cart: Cart;
}

export const useCartHydrator = ({ cart }: CartHydratorProps) => {
  const { setCurrentCart } = useCartStore();
  useEffect(() => {
    setCurrentCart(cart);
  }, [cart, setCurrentCart]);
};

export default function CartHydrator({ cart }: CartHydratorProps) {
  useCartHydrator({ cart });

  return null;
}
