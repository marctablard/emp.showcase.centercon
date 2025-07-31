import { TrackingInfo } from '@/platform/services/model/tracking';

/**
 * Service interface for order tracking operations.
 * Provides methods to retrieve tracking information for orders.
 */
export interface TrackingService {
  /**
   * Retrieves tracking information for an order.
   *
   * @param orderId - The ID of the order to get tracking information for
   * @returns A promise that resolves to the tracking information if found, or null if not found
   */
  getOrderTrackingInfo(orderId: string): Promise<TrackingInfo | null>;
}
