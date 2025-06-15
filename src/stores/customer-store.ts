'use client';

import { create } from 'zustand';
import { Address } from '@/platform/services/model/common';
import { Customer } from '@/platform/services/model/customer/customer';

export interface CustomerState {
  // Site data
  customer: Customer | null | undefined;
  addresses: Address[] | undefined;
  loading: boolean;
  addressLoading: boolean;
}
interface CustomerActions {
  setCustomer: (customer: Customer | null | undefined) => void;
  getCustomer: () => Customer | null | undefined;

  setAddresses: (addresses: Address[] | undefined) => void;
  getAddresses: () => Address[] | undefined;

  setLoading: (loading: boolean) => void;
  getLoading: () => boolean;

  setAddressLoading: (addressLoading: boolean) => void;
  getAddressLoading: () => boolean;

  reset: () => void;
}
export type CustomerStore = CustomerState & CustomerActions;

const defaultState: CustomerState = {
  customer: undefined,
  addresses: undefined,
  loading: false,
  addressLoading: false,
};

export const createCustomerStore = (initState: CustomerState = defaultState) => {
  return create<CustomerStore>()((set, get) => ({
    ...initState,
    setCustomer: (customer: Customer | null | undefined) => set({ customer }),
    getCustomer: () => get().customer,
    setAddresses: (addresses: Address[] | undefined) => set({ addresses }),
    getAddresses: () => get().addresses,
    setLoading: (loading: boolean) => set({ loading }),
    getLoading: () => get().loading,
    setAddressLoading: (addressLoading: boolean) => set({ addressLoading }),
    getAddressLoading: () => get().addressLoading,
    reset: () => set(defaultState),
  }));
};
