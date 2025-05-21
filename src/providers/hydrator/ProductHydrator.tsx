'use client'

import { Product } from "@/platform/services/model/product"
import { useProductStore } from "../StoreProvider"
import { useEffect } from "react"

export interface ProductHydratorProps {
    product: Product;
    isCurrent?: boolean;
}

export const useProductHydrator = ({ product, isCurrent }: ProductHydratorProps) => {
    const { setCurrentProduct, addProduct } = useProductStore()
    useEffect(() => {
            if (isCurrent) {
                setCurrentProduct(product)
            } else {
                addProduct(product)
            }
    }, [product, isCurrent, setCurrentProduct, addProduct])
}

export default function ProductHydrator({ product, isCurrent }: ProductHydratorProps) {
    useProductHydrator({ product, isCurrent })
    
    return null
}