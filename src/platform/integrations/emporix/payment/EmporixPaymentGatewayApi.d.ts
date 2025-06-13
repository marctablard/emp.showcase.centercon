import type { EmporixPaymentMode, EmporixPaymentModeFrontend } from '@/platform/integrations/model/payment';

/**
 * Interface for the Emporix Payment Gateway API
 */
export interface EmporixPaymentGatewayApi {
  /**
   * Get all payment modes configured for the tenant
   * (for usage in Frontend)
   * @returns Promise with array of payment modes
   */
  getPaymentModesFrontend(): Promise<EmporixPaymentModeFrontend[]>;

  /**
   * Get a specific payment mode by ID
   * @param id Payment mode ID
   * @returns Promise with payment mode or null if not found
   */
  getPaymentMode(id: string): Promise<EmporixPaymentMode | null>;
}
