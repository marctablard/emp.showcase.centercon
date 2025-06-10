import { PaymentMode } from '../model/payment';

/**
 * Service for payment operations
 */
export interface PaymentService {
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
