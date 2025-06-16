'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Cart } from '@/platform/services/model/cart/cart';
import {
  CheckoutAddress,
  CheckoutPaymentMethod,
  CheckoutShipping,
  ContactData,
} from '@/platform/services/model/checkout/checkout';

export interface CheckoutState {
  // Cart data
  cart: Cart | null;
  contactData: ContactData | null;
  shippingAddress: CheckoutAddress | null;
  billingAddress: CheckoutAddress | null;
  paymentMethod: CheckoutPaymentMethod | null;
  shippingMethod: CheckoutShipping | null;
}

interface CheckoutActions {
  // Checkout operations
  setCart: (cart: Cart) => void;
  getCart: () => Cart | null;
  reset: () => void;
  setContactData: (contactData: ContactData) => void;
  setShippingAddress: (address: CheckoutAddress) => void;
  setBillingAddress: (address: CheckoutAddress) => void;
  setPaymentMethod: (paymentMethod: CheckoutPaymentMethod) => void;
  setShippingMethod: (shippingMethod: CheckoutShipping) => void;
}

export type CheckoutStore = CheckoutState & CheckoutActions;

const defaultState: CheckoutState = {
  cart: null,
  contactData: null,
  shippingAddress: null,
  billingAddress: null,
  paymentMethod: null,
  shippingMethod: null,
};

export const createCheckoutStore = (initState: CheckoutState = defaultState) => {
  return create<CheckoutStore>()(
    persist(
      (set, get) => ({
        ...initState,
        setCart: (cart: Cart) => {
          set({ cart });
        },
        getCart: () => get().cart,
        reset: () => {
          set({
            cart: null,
            contactData: null,
            shippingAddress: null,
            billingAddress: null,
            paymentMethod: null,
            shippingMethod: null,
          });
        },
        setContactData: (contactData: ContactData) => {
          set({ contactData });
        },
        setShippingAddress: (address: CheckoutAddress) => {
          set({ shippingAddress: address });
        },
        setBillingAddress: (address: CheckoutAddress) => {
          set({ billingAddress: address });
        },
        setPaymentMethod: (paymentMethod: CheckoutPaymentMethod) => {
          set({ paymentMethod });
        },
        setShippingMethod: (shippingMethod: CheckoutShipping) => {
          set({ shippingMethod });
        },
      }),
      {
        name: 'emp-checkout',
        storage: createJSONStorage(() => sessionStorage),
      },
    ),
  );
};
