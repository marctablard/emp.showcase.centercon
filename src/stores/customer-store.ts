'use client';

import { create } from 'zustand';
import { Customer } from '@/platform/services/model/customer/customer';

export interface CustomerState {
  // Site data
  customer: Customer | null | undefined;
  loading: boolean;
}

interface CustomerActions {
  setCustomer: (customer: Customer | null | undefined) => void;
  getCustomer: () => Customer | null | undefined;

  setLoading: (loading: boolean) => void;
  getLoading: () => boolean;
  reset: () => void;
}
export type CustomerStore = CustomerState & CustomerActions;

const defaultState: CustomerState = {
  customer: undefined,
  loading: false,
};

export const createCustomerStore = (initState: CustomerState = defaultState) => {
  return create<CustomerStore>()((set, get) => ({
    ...initState,
    setCustomer: (customer: Customer | null | undefined) => set({ customer }),
    getCustomer: () => get().customer,
    setLoading: (loading: boolean) => set({ loading }),
    getLoading: () => get().loading,
    reset: () => set(defaultState),
  }));
};
