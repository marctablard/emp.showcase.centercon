// src/stores/counter-store.ts
import { Product } from '@/platform/services/model/product'
import { create } from 'zustand/react'

export type ProductState = {
  currentProductId : string | null,
  products : {
    [id : string]: Product
  }
}

export type ProductActions = {
  getProduct: (id : string) => Product | null
  getCurrentProduct: () => Product | null
  setCurrentProduct: (product: Product) => void
  addProduct: (product: Product) => void
}

export type ProductStore = ProductState & ProductActions

export const initProductStore = () : ProductState => {
  return {
    currentProductId: null,
    products: {}
  }
}

export const defaultInitState: ProductState = {
  currentProductId: null,
  products: {}
}

export const createProductStore = (
  initState: ProductState = defaultInitState,
) => {
  return create<ProductStore>()((set, get) => ({
    ...initState,
    setCurrentProduct: (product: Product) => set((state) => {
        if (product.id == state.currentProductId) {
          return state;
        }
        if (product) {
            return { currentProductId: product.id, products: { ...state.products, [product.id]: product } }
        }
        return { currentProductId: null }
    }),
    addProduct: (product: Product) => set((state) => {
      if (product) {
        state.products = {
          ...state.products, 
          [product.id]: product  
        }
      }
      return state;
    }),
    getCurrentProduct: () => {
        const state = get();
        return state.currentProductId ? state.products[state.currentProductId] : null
    },
    getProduct: (id : string) => {
        const state = get();
        return state.products[id] || null
    }
  }))
}