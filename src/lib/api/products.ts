/**
 * Shared API layer for product-related data fetching
 * Can be used by both server and client components
 */

import { Product } from "@/platform/services/model/product";
import { headers } from "next/headers";
import { cache } from "react";


/**
 * Fetch a product by ID
 * Uses React's cache() to deduplicate requests within the same render cycle
 */
export const fetchProductById = cache(async (id: string): Promise<Product> => {
  try {
    const clientHeaders = await headers();
    const host = clientHeaders.get('host') || 'localhost:3000'; 
    const response = await fetch(`http://${host}/api/products/${id}`, {
      // This makes the request work in both client and server environments
      cache: 'no-store',
      next: { tags: [`product-${id}`] }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
});
