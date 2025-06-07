import type { PaymentMode } from '@/platform/services/model';

/**
 * Interface for the Emporix Payment Gateway API
 */
export interface PaymentGatewayApi {
  /**
   * Get all payment modes configured for the tenant
   * @returns Promise with array of payment modes
   */
  getPaymentModes(): Promise<PaymentMode[]>;
  
  /**
   * Get a specific payment mode by ID
   * @param id Payment mode ID
   * @returns Promise with payment mode or null if not found
   */
  getPaymentMode(id: string): Promise<PaymentMode | null>;
}
