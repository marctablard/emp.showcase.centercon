'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Currency } from '@/platform/services/model/common';
import type { Region } from '@/platform/services/model/common';
import type { PaymentMode } from '@/platform/services/model/payment';
import type { ShippingMethod } from '@/platform/services/model/shipping';

export interface SiteState {
  // Site data
  shippingMethods: ShippingMethod[];
  shippingMethodsLoading: boolean;
  paymentModes: PaymentMode[] | undefined;
  paymentModesLoading: boolean;
  availableCurrencies: Currency[];
  currenciesLoading: boolean;
  availableRegions: Region[];
  regionsLoading: boolean;
}

interface SiteActions {
  // Shipping methods
  setShippingMethods: (methods: ShippingMethod[]) => void;
  getShippingMethods: () => ShippingMethod[];
  setShippingMethodsLoading: (loading: boolean) => void;

  // Payment modes
  setPaymentModes: (modes: PaymentMode[]) => void;
  getPaymentModes: () => PaymentMode[];
  setPaymentModesLoading: (loading: boolean) => void;

  // Currencies
  setCurrencies: (currencies: Currency[]) => void;
  getCurrencies: () => Currency[];
  setCurrenciesLoading: (loading: boolean) => void;

  // Regions
  setRegions: (regions: Region[]) => void;
  getRegions: () => Region[];
  setRegionsLoading: (loading: boolean) => void;

  // Global actions
  reset: () => void;
}

export type SiteStore = SiteState & SiteActions;

const defaultState: SiteState = {
  shippingMethods: [],
  shippingMethodsLoading: false,
  paymentModes: undefined,
  paymentModesLoading: false,
  availableCurrencies: [],
  currenciesLoading: false,
  availableRegions: [],
  regionsLoading: false,
};

export const createSiteStore = (initState: SiteState = defaultState) => {
  return create<SiteStore>()(
    persist(
      (set, get) => ({
        ...initState,

        // Shipping methods
        setShippingMethods: (methods: ShippingMethod[]) => {
          set({ shippingMethods: methods });
        },
        getShippingMethods: () => get().shippingMethods,
        setShippingMethodsLoading: (loading: boolean) => {
          set({ shippingMethodsLoading: loading });
        },

        // Payment modes
        setPaymentModes: (modes: PaymentMode[]) => {
          set({ paymentModes: modes });
        },
        getPaymentModes: () => get().paymentModes,
        setPaymentModesLoading: (loading: boolean) => {
          set({ paymentModesLoading: loading });
        },

        // Currencies
        setCurrencies: (currencies: Currency[]) => {
          set({ availableCurrencies: currencies });
        },
        getCurrencies: () => get().availableCurrencies,
        setCurrenciesLoading: (loading: boolean) => {
          set({ currenciesLoading: loading });
        },

        // Regions
        setRegions: (regions: Region[]) => {
          set({ availableRegions: regions });
        },
        getRegions: () => get().availableRegions,
        setRegionsLoading: (loading: boolean) => {
          set({ regionsLoading: loading });
        },

        // Global actions
        reset: () => {
          set({
            shippingMethods: [],
            shippingMethodsLoading: false,
            paymentModes: undefined,
            paymentModesLoading: false,
            availableCurrencies: [],
            currenciesLoading: false,
            availableRegions: [],
            regionsLoading: false,
          });
        },
      }),
      {
        name: 'emp-site',
        storage: createJSONStorage(() => sessionStorage),
      },
    ),
  );
};

// Default store instance
export const useSiteStore = createSiteStore();
