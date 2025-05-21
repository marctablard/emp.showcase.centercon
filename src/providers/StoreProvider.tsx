'use client'

import { type ReactNode, createContext, useContext, useRef } from 'react'
import { createProductStore, initProductStore } from '../stores/product/products-store'
import { useStore } from 'zustand/react'
  
export type ProductStoreApi = ReturnType<typeof createProductStore>
export const ProductStoreContext = createContext<ProductStoreApi | null>(null)

export interface StoreProviderProps {
  children: ReactNode
}

export const StoreProvider = ({
  children
}: StoreProviderProps) => {
  const productStoreRef = useRef<ProductStoreApi | null>(null)
  if (productStoreRef.current === null) {
    const initState = initProductStore();
    
    productStoreRef.current = createProductStore(initState);
  }

  
  return (
    <ProductStoreContext.Provider value={productStoreRef.current}>
      {children}
    </ProductStoreContext.Provider>
  )

}

export const useProductStore = () => {
  const storeContext = useContext(ProductStoreContext)
  if (!storeContext) {
    throw new Error(`useProductStore must be used within StoreProvider`)
  }
  return useStore(storeContext)
}