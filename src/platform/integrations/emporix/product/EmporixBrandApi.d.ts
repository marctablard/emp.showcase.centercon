import { EmporixPaginatedResponse } from '../model';
import { Brand } from './model';

export interface EmporixBrandApi {
  /**
   * Retrieves a specified brand's details.
   * @link https://developer.emporix.io/docs/openapi/brand/#operation/GET-brand-retrieve-brand
   * @param id
   */
  getBrand(id: string): Promise<Brand | undefined>;

  /**
   * Retrieves a list of brands.
   * @link https://developer.emporix.io/docs/openapi/brand/#operation/GET-brand-list-brands
   * @param page number
   * @param pageSize number
   */
  getBrands(page?: number, pageSize?: number): Promise<EmporixPaginatedResponse<Brand>>;
}
