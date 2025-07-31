import type { Paginated, Product } from '../../types/data';

/**
 * Interface for product service.
 * Defines methods for product operations.
 */
export interface ProductService {
  /**
   * Retrieves a product by its ID.
   * @param id The ID of the product to retrieve.
   * @returns The product if found, otherwise undefined.
   */
  getProductById(id: string): Promise<Product | undefined>;

  /**
   * Retrieves a paginated list of products.
   * @param page Optional page number.
   * @param pageSize Optional page size.
   * @returns A paginated list of products.
   */
  getProducts(page?: number, pageSize?: number): Promise<Paginated<Product>>;
}
