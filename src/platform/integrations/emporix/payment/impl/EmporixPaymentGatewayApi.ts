import { inject } from 'inversify';
import { injectable } from '@/platform/core/di/injectable';
import type { PaymentMode } from '@/platform/services/model';
import type EmporixApiClient from '../../common/impl/EmporixApiInvoker';
import type { EmporixConfig } from '../../config';
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

  async getPaymentModes(): Promise<PaymentMode[]> {
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

  async getPaymentMode(id: string): Promise<PaymentMode | null> {
    const response = await this.apiClient.authenticatedFetch(
      `/payment-gateway/${this.config.tenant}/paymentmodes/frontend/${id}`,
      { method: 'GET' },
      'public',
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
