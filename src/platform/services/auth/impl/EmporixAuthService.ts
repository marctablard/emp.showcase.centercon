import { inject } from 'inversify';
import { injectable } from '@/platform/core/di/injectable';
import EmporixCustomerApi from '@/platform/integrations/emporix/customer/impl/EmporixCustomerApi';
import { EmporixCustomer } from '@/platform/integrations/emporix/model/customer';
import EmporixSessionContextApi from '@/platform/integrations/emporix/session/impl/EmporixSessionContextApi';
import { Credentials, Registration, Session } from '@/platform/services/model/auth/auth';
import EmporixAddressMapper from '../../model/common/impl/EmporixAddressMapper';
import { AuthService } from '../AuthService';
import { EmporixAddress } from '@/platform/integrations/emporix/model';

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
  ) {}

  async login(credentials: Credentials): Promise<Session> {
    try {
      const session = await this.emporixCustomerApi.login(credentials.username, credentials.password);
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
    };
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
