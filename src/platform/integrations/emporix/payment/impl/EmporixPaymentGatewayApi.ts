import { inject } from 'inversify';
import { injectable } from '@/platform/core/di/injectable';
import type EmporixApiClient from '../../common/impl/EmporixApiInvoker';
import type { EmporixConfig } from '../../config';
import { EmporixPaymentMode, EmporixPaymentModeFrontend } from '../../model/payment';
import { PaymentGatewayApi } from '../PaymentGatewayApi';

@injectable('EmporixPaymentGatewayApi', 'Singleton')
class EmporixPaymentGatewayApi implements PaymentGatewayApi {
  constructor(
    @inject('EmporixApiInvoker') private apiClient: EmporixApiClient,
    @inject('EmporixConfig') private config: EmporixConfig,
  ) {
    this.apiClient = apiClient;
    this.config = config;
  }

  async getPaymentModesFrontend(): Promise<EmporixPaymentModeFrontend[]> {
    const response = await this.apiClient.authenticatedFetch(
      `/payment-gateway/${this.config.tenant}/paymentmodes/frontend`,
      { method: 'GET' },
      'public',
    );

    if (!response.ok) {
      throw new Error(`Failed to get payment modes: ${response.statusText}`);
    }

    return await response.json();
  }

  async getPaymentMode(id: string): Promise<EmporixPaymentMode | null> {
    const response = await this.apiClient.authenticatedFetch(
      `/payment-gateway/${this.config.tenant}/paymentmodes/config/${id}`,
      { method: 'GET' },
      'service',
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      } else {
        throw new Error(`Failed to get payment mode: ${response.statusText}`);
      }
    }

    return await response.json();
  }
}

export default EmporixPaymentGatewayApi;
