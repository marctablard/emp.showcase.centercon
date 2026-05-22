import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { create } from 'zustand/react';
import type { Product } from '@/platform/services/model/product';

// re-export for convenience
export { useComparisonStore } from '@/providers/StoreProvider';

export const MAX_COMPARISON_PRODUCTS = 4;

export type ComparisonState = {
  products: Product[];
};

export type ComparisonActions = {
  addProduct: (product: Product) => boolean;
  removeProduct: (productId: string) => void;
  isInComparison: (productId: string) => boolean;
  clearComparison: () => void;
  getCount: () => number;
};

export type ComparisonStore = ComparisonState & ComparisonActions;

const defaultState: ComparisonState = {
  products: [],
};

export const createComparisonStore = (initState: ComparisonState = defaultState) => {
  const COMPARISON_STORAGE_NAME = process.env.NEXT_PUBLIC_COMPARISON_STORAGE_NAME || 'comparison-storage';

  return create<ComparisonStore>()(
    persist(
      immer((set, get) => ({
        ...initState,
        addProduct: (product: Product): boolean => {
          const state = get();
          if (state.products.some((p) => p.id === product.id)) {
            return false;
          }
          if (state.products.length >= MAX_COMPARISON_PRODUCTS) {
            return false;
          }
          set((draft) => {
            draft.products.push(product);
          });
          return true;
        },
        removeProduct: (productId: string) =>
          set((state) => {
            state.products = state.products.filter((p) => p.id !== productId);
          }),
        isInComparison: (productId: string): boolean => {
          return get().products.some((p) => p.id === productId);
        },
        clearComparison: () =>
          set((state) => {
            state.products = [];
          }),
        getCount: (): number => get().products.length,
      })),
      {
        name: COMPARISON_STORAGE_NAME,
      },
    ),
  );
};
