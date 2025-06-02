import { create } from 'zustand/react';
import { Product } from '@/platform/services/model/product';

// src/stores/counter-store.ts
// re-export for convenience
export { useProductStore } from '@/providers/StoreProvider';

export type ProductState = {
  currentProductId: string | null;
  products: {
    [id: string]: Product;
  };
};

export type ProductActions = {
  getProduct: (id: string) => Product | null;
  getCurrentProduct: () => Product | null;
  setCurrentProduct: (product: Product) => void;
  addProduct: (product: Product) => void;
};

export type ProductStore = ProductState & ProductActions;

const defaultState: ProductState = {
  currentProductId: null,
  products: {},
};

export const createProductStore = (initState: ProductState = defaultState) => {
  return create<ProductStore>()((set, get) => ({
    ...initState,
    setCurrentProduct: (product: Product) =>
      set((state) => {
        if (product.id == state.currentProductId) {
          return state;
        }
        if (product) {
          return { currentProductId: product.id, products: { ...state.products, [product.id]: product } };
        }
        return { currentProductId: null };
      }),
    addProduct: (product: Product) =>
      set((state) => {
        if (product) {
          state.products = {
            ...state.products,
            [product.id]: product,
          };
        }
        return state;
      }),
    getCurrentProduct: () => {
      const state = get();
      return state.currentProductId ? state.products[state.currentProductId] : null;
    },
    getProduct: (id: string) => {
      const state = get();
      return state.products[id] || null;
    },
  }));
};
