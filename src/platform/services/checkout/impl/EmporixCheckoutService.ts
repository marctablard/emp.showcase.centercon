import { injectable } from '@/platform/core/di/injectable';
import { inject } from 'inversify';
import { CheckoutService } from '../CheckoutService';
import { CheckoutRequest, CheckoutResponse, QuoteCheckoutRequest } from '../../model/checkout';
import type { CheckoutApi } from '@/platform/integrations/emporix/checkout/CheckoutApi';
import type { CustomerService } from '@/platform/services/customer/CustomerService';
import {
  EmporixCartCheckoutRequest,
  EmporixCheckoutCustomer,
  EmporixPaymentMethod,
  EmporixShipping,
} from '@/platform/integrations/emporix/model';

/**
 * Implementation of CheckoutService for Emporix checkout.
 * Maps between Emporix API checkout format and internal Checkout model.
 */
@injectable('CheckoutService', 'Singleton')
class EmporixCheckoutService implements CheckoutService {
  private checkoutApi: CheckoutApi;
  private customerService: CustomerService;

  constructor(
    @inject('EmporixCheckoutApi') checkoutApi: CheckoutApi,
    @inject('CustomerService') customerService: CustomerService,
  ) {
    this.checkoutApi = checkoutApi;
    this.customerService = customerService;
  }

  async checkout(request: CheckoutRequest): Promise<CheckoutResponse> {
    const isGuest: boolean = !request.customer.id;
    const customer = await this.customerService.getCurrentCustomer();
    if (isGuest && customer && request.customer.id != customer.id) {
      throw new Error('Mismatching Customer on Checkout!');
    }
    const addresses = request.addresses.map((address) => ({
      ...address,
      contactName: address.contactName || request.customer.firstName + ' ' + request.customer.lastName,
      contactPhone: address.contactPhone || request.customer.phone,
      type: address.type || 'SHIPPING',
    }));
    const emporixCustomer: EmporixCheckoutCustomer = {
      id: request.customer.id,
      firstName: request.customer.firstName,
      lastName: request.customer.lastName,
      email: request.customer.email,
      company: request.customer.company,
      guest: isGuest,
    };
    const paymentMethods: EmporixPaymentMethod[] = [request.paymentMethod];
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
      paymentMethods: paymentMethods,
    };
    const response = await (isGuest
      ? this.checkoutApi.guestCheckout(checkoutRequest)
      : this.checkoutApi.checkout(checkoutRequest));
    return response;
    /*
    // Call the appropriate API method based on whether it's a guest checkout or not
    let apiResponse;
    if ('guest' in apiRequest.customer && apiRequest.customer.guest) {
      apiResponse = await this.checkoutApi.guestCheckout(apiRequest);
    } else {
      apiResponse = await this.checkoutApi.checkout(apiRequest);
    }
    
    // Map API response to service model
    return this.mapper.mapToService(apiResponse);
    */
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
}

export default EmporixCheckoutService;
