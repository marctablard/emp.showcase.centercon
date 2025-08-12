import { inject } from 'inversify';
import { injectable } from '@/platform/core/di/injectable';
import EmporixCustomerApi from '@/platform/integrations/emporix/customer/impl/EmporixCustomerApi';
import { EmporixAddress } from '@/platform/integrations/emporix/model';
import { EmporixCustomer } from '@/platform/integrations/emporix/model/customer';
import EmporixSessionContextApi from '@/platform/integrations/emporix/session/impl/EmporixSessionContextApi';
import { Credentials, Registration, Session } from '@/platform/services/model/auth/auth';
import type { CartMigrationService } from '../../cart/CartMigrationService';
import type { CartService } from '../../cart/CartService';
import EmporixAddressMapper from '../../model/common/impl/EmporixAddressMapper';
import type { SessionService } from '../../session';
import { AuthService } from '../AuthService';

/**
 * Emporix implementation of the AuthService
 * Provides authentication functionality using the Emporix OAuth API
 */
@injectable('AuthService', 'Singleton')
export class EmporixAuthService implements AuthService {
  /**
   * Constructor with dependency injection
   * @param oauthApi The Emporix OAuth API implementation
   * @param authMapper The auth mapper for converting between API and domain models
   */
  constructor(
    @inject('EmporixSessionContextApi')
    private readonly emporixSessionContextApi: EmporixSessionContextApi,
    @inject('EmporixCustomerApi')
    private readonly emporixCustomerApi: EmporixCustomerApi,
    @inject('EmporixAddressMapper')
    private readonly emporixAddressMapper: EmporixAddressMapper,
    @inject('CartMigrationService')
    private readonly cartMigrationService: CartMigrationService,
    @inject('SessionService')
    private readonly sessionService: SessionService,
    @inject('CartService')
    private readonly cartService: CartService,
  ) {}

  async login(credentials: Credentials): Promise<Session> {
    try {
      const oldSession = await this.sessionService.getCurrent();
      if (!oldSession) {
        throw new Error('Failed to get session context');
      }
      const siteCode = oldSession.siteCode || 'main';
      const oldSessionId = oldSession.id || '';
      const anonymousCart = await this.cartService.getCartByCriteria(siteCode, oldSessionId, undefined);
      if (!anonymousCart) {
        throw new Error('Failed to get anonymous cart');
      }

      const session = await this.emporixCustomerApi.login(credentials.username, credentials.password);
      if (!session) {
        throw new Error('Failed to get session context');
      }
      // Capture the resulting customer cart id for the return value
      let customerCartId: string | undefined;
      if (anonymousCart.id && session.customerId) {
        const customerCart = await this.cartService.getCartByCriteria(siteCode, '', session.customerId);
        if (!customerCart) {
          throw new Error('Failed to get customer cart');
        }
        await this.cartMigrationService.mergeCarts(anonymousCart.id, customerCart.id);
        customerCartId = customerCart.id;
      }
      return {
        sessionId: session.sessionId,
        customerId: session.customerId,
        siteCode: session.siteCode,
        currency: session.currency,
        cartId: customerCartId,
        country: session.targetLocation,
      };
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    await this.emporixCustomerApi.logout();
  }

  async register(registration: Registration): Promise<Session> {
    const customer: Omit<EmporixCustomer, 'id' | 'customerNumber'> = {
      contactEmail: registration.credentials.username,
      firstName: registration.customer?.firstName,
      lastName: registration.customer?.lastName,
      company: registration.customer?.company,
    };
    if (customer.company) {
      customer.businessModel = 'B2B';
      customer.b2b = {
        // TODO: Add actual company registration ID
        companyRegistrationId: '123-456-789',
      };
    } else {
      customer.businessModel = 'B2C';
    }

    const currentSession = await this.sessionService.getCurrent();

    if (!currentSession) {
      throw new Error('Failed to get session context');
    }

    customer.preferredLanguage = currentSession.language || 'en';
    customer.preferredCurrency = currentSession.currency || 'EUR';
    customer.preferredSite = currentSession.siteCode || 'main';

    const address: EmporixAddress | undefined = registration.address
      ? this.emporixAddressMapper.mapToSource(registration.address)
      : undefined;
    const session = await this.emporixCustomerApi.signup({
      email: registration.credentials.username,
      password: registration.credentials.password,
      customerDetails: customer,
      customerAddress: address,
    });

    if (!session) {
      throw new Error('Failed to register User');
    }
    return this.login(registration.credentials);
  }

  async getCurrentSession(): Promise<Session | null> {
    const session = await this.emporixSessionContextApi.getOwnSessionContext();

    if (!session) {
      throw new Error('Failed to get session context');
    }
    return {
      sessionId: session.sessionId,
      customerId: session.customerId,
      siteCode: session.siteCode,
      currency: session.currency,
      cartId: session.cartId,
      country: session.targetLocation,
    };
  }
}

export default EmporixAuthService;
