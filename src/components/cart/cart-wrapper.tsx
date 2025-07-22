'use client';

import { useEffect, useRef } from 'react';
import { usePolling } from '@/hooks/util/usePolling';
import { Cart } from '@/platform/services/model/cart/cart';
import { useCartStore } from '@/providers/StoreProvider';

interface CartWrapperProps {
  initialCart?: Cart | null;
  children: React.ReactNode;
}

/**
 * CartWrapper component that handles cart polling at the layout level
 * This component should be placed high in the component tree, ideally at the layout level
 */
export const CartWrapper = ({ children, initialCart }: CartWrapperProps) => {
  const { fetchCart, currentCart, lastModification, pollingActive, setPollingActive, setCurrentCart } = useCartStore();

  // Initialize with initialCart if provided and cart is undefined
  if (currentCart === undefined && initialCart !== undefined) {
    setCurrentCart(initialCart);
  }

  const initialized = useRef(false);

  // Set up polling
  const { start: startPolling, stop: stopPolling } = usePolling(() => {
    fetchCart();
  }, 10000); // Poll every 10 seconds

  // Initialize cart on first render
  useEffect(() => {
    if (!initialized.current) {
      fetchCart();
      initialized.current = true;
    }
  }, [fetchCart]);

  // Handle polling based on cart state
  useEffect(() => {
    if (pollingActive) {
      startPolling();
    } else {
      stopPolling();
    }
  }, [pollingActive, startPolling, stopPolling]);

  // Check if we should stop polling based on cart updates
  useEffect(() => {
    if (currentCart && lastModification && pollingActive) {
      if (currentCart.processUpdate?.updatedAt) {
        const updatedAt = new Date(currentCart.processUpdate.updatedAt);
        if (updatedAt.getTime() > lastModification.getTime()) {
          setPollingActive(false);
        }
      }
    }
  }, [currentCart, lastModification, pollingActive, setPollingActive]);

  return <>{children}</>;
};
