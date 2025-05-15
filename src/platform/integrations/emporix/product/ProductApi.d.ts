import { Product, PaginatedResponse } from "./model";
export interface ProductApi {

  /**
   * Retrieves a specified product's details.
   * @link https://developer.emporix.io/docs/openapi/product/#operation/GET-product-retrieve-product
   * @param id 
   */
  getProduct(id: string): Promise<Product | undefined>

  /**
   * Retrieves a list of products.
   * @link https://developer.emporix.io/docs/openapi/product/#operation/GET-product-list-products
   * @param page number
   * @param pageSize number
   */
  getProducts(page?: number, pageSize?: number): Promise<PaginatedResponse<Product>>
}