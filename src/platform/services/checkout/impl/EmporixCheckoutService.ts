import { inject } from 'inversify';
import { injectable } from '@/platform/core/di/injectable';
import type { EmporixCheckoutApi } from '@/platform/integrations/emporix/checkout/EmporixCheckoutApi';
import {
  EmporixCartCheckoutRequest,
  EmporixCheckoutCustomer,
  EmporixCheckoutPaymentMethod,
  EmporixShipping,
} from '@/platform/integrations/emporix/model';
import EmporixPaymentGatewayApi from '@/platform/integrations/emporix/payment/impl/EmporixPaymentGatewayApi';
import type { CustomerService } from '@/platform/services/customer/CustomerService';
import { CheckoutPaymentMethod, CheckoutRequest, CheckoutResponse, QuoteCheckoutRequest } from '../../model/checkout';
import { CheckoutService } from '../CheckoutService';
import type { CheckoutValidator } from '../validation/CheckoutValidator';

/**
 * Implementation of CheckoutService for Emporix checkout.
 * Maps between Emporix API checkout format and internal Checkout model.
 */
@injectable('CheckoutService', 'Singleton')
class EmporixCheckoutService implements CheckoutService {
  constructor(
    @inject('EmporixCheckoutApi') private checkoutApi: EmporixCheckoutApi,
    @inject('EmporixPaymentGatewayApi') private paymentGatewayApi: EmporixPaymentGatewayApi,
    @inject('CustomerService') private customerService: CustomerService,
    @inject('CheckoutValidator') private checkoutValidator: CheckoutValidator,
  ) {}

  async checkout(request: CheckoutRequest): Promise<CheckoutResponse> {
    const customer = await this.customerService.getCustomer();

    // First do the basic validation
    let emporixCustomer: EmporixCheckoutCustomer;
    if (!customer) {
      const result = this.checkoutValidator.validateGuestCheckoutRequest(request);
      if (!result.success) {
        throw new Error('Checkout Validation Failed!', {
          cause: result.errors,
        });
      }
      if (!request.customer) {
        throw new Error('Contact Data is required for guest checkout');
      }
      emporixCustomer = {
        email: request.customer.email,
        firstName: request.customer.firstName,
        lastName: request.customer.lastName,
        company: request.customer.company,
        guest: true,
      };
    } else {
      const result = this.checkoutValidator.validateCheckoutRequest(request);
      if (!result.success) {
        throw new Error('Checkout Validation Failed!', {
          cause: result.errors,
        });
      }
      emporixCustomer = {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        company: customer.company,
        guest: false,
      };
    }

    const addresses = request.addresses.map((address) => ({
      ...address,
      contactName: address.contactName || emporixCustomer.firstName + ' ' + emporixCustomer.lastName,
      contactPhone: address.contactPhone || '',
      type: address.type || 'SHIPPING',
    }));
    // TODO implement support for multiple paymentMethods in Frontend
    const paymentMethods: CheckoutPaymentMethod[] = [request.paymentMethod];

    const shipping: EmporixShipping = {
      methodId: request.shipping.methodId,
      methodName: request.shipping.methodName,
      amount: request.shipping.amount,
      zoneId: request.shipping.zoneId,
    };
    const checkoutRequest: EmporixCartCheckoutRequest = {
      cartId: request.cartId,
      customer: emporixCustomer,
      addresses: addresses,
      shipping: shipping,
      paymentMethods: await Promise.all(paymentMethods.map((pm) => this.getCheckoutPaymentMethod(pm))),
    };
    if (emporixCustomer.guest) {
      return this.checkoutApi.guestCheckout(checkoutRequest);
    } else {
      return this.checkoutApi.checkout(checkoutRequest);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async checkoutFromQuote(request: QuoteCheckoutRequest): Promise<CheckoutResponse> {
    throw new Error('Not implemented');
    /*
    // Map service model to API model
    const apiRequest = this.mapper.mapQuoteToApi(request);
    
    // Call the API
    const apiResponse = await this.checkoutApi.checkoutFromQuote(apiRequest);
    
    // Map API response to service model
    return this.mapper.mapToService(apiResponse);
    */
  }

  private async getCheckoutPaymentMethod(paymentMethod: CheckoutPaymentMethod): Promise<EmporixCheckoutPaymentMethod> {
    const emporixPaymentMode = await this.paymentGatewayApi.getPaymentMode(paymentMethod.id);
    if (!emporixPaymentMode) {
      throw new Error('Failed to get payment mode');
    }
    return {
      provider: emporixPaymentMode.provider,
      method: emporixPaymentMode.code,
      amount: paymentMethod.amount,
      customAttributes: paymentMethod.customAttributes,
    };
  }
}

export default EmporixCheckoutService;
