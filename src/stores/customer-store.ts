'use client';

import { create } from 'zustand';
import { Customer } from '@/platform/services/model/customer/customer';
import { CustomerAddress } from '@/platform/services/model/customer/customer';

export interface CustomerState {
  // Site data
  customer: Customer | null | undefined;
  addresses: CustomerAddress[] | undefined;
  loading: boolean;
  addressLoading: boolean;
}
interface CustomerActions {
  setCustomer: (customer: Customer | null | undefined) => void;
  getCustomer: () => Customer | null | undefined;

  setAddresses: (addresses: CustomerAddress[] | undefined) => void;
  getAddresses: () => CustomerAddress[] | undefined;

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
    setAddresses: (addresses: CustomerAddress[] | undefined) => set({ addresses }),
    getAddresses: () => get().addresses,
    setLoading: (loading: boolean) => set({ loading }),
    getLoading: () => get().loading,
    setAddressLoading: (addressLoading: boolean) => set({ addressLoading }),
    getAddressLoading: () => get().addressLoading,
    reset: () => set(defaultState),
  }));
};
