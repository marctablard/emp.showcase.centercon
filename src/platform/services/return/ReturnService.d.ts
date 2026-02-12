import { Return } from '../model/return';

/**
 * Item to return - contains item ID and quantity
 */
export interface CreateReturnItem {
  id: string;
  quantity: number;
}

/**
 * Interface for return service.
 * Defines methods for return operations.
 */
export interface ReturnService {
  /**
   * Get all returns for the current user
   * @param pageNumber Optional page number (default: 1)
   * @param pageSize Optional page size (default: 60)
   * @param sort Optional sort parameter
   * @param query Optional query parameter for filtering
   * @returns Promise with array of returns
   */
  getReturns(pageNumber?: number, pageSize?: number, sort?: string, query?: string): Promise<Return[]>;

  /**
   * Get a specific return by ID
   * @param returnId The ID of the return to retrieve
   * @returns Promise with the return or undefined if not found
   */
  getReturn(returnId: string): Promise<Return | undefined>;

  /**
   * Create a new return for an order
   * @param orderId The ID of the order to create return for
   * @param items Array of items to return with quantities
   * @returns Promise with the created return ID
   */
  createReturn(orderId: string, items: CreateReturnItem[]): Promise<string>;
}
