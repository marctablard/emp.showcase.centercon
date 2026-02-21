import crypto from 'crypto';
import { inject } from 'inversify';
import { injectable } from '@/platform/core/di/injectable';
import EmporixCustomerApi from '@/platform/integrations/emporix/customer/impl/EmporixCustomerApi';
import { EmporixAddress } from '@/platform/integrations/emporix/model';
import { EmporixCustomer } from '@/platform/integrations/emporix/model/customer';
import EmporixSessionContextApi from '@/platform/integrations/emporix/session/impl/EmporixSessionContextApi';
import { Credentials, Registration, Session } from '@/platform/services/model/auth/auth';
import type { CartMigrationService } from '../../cart/CartMigrationService';
import type { CartService } from '../../cart/CartService';
import type { LoggerService } from '../../logger/LoggerService';
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
    @inject('LoggerService')
    private readonly logger: LoggerService,
  ) {}

  async login(credentials: Credentials): Promise<Session> {
    const oldSession = await this.sessionService.getCurrent();
    const password = credentials.password || this.generateSsoPassword(credentials.username);
    const session = await this.emporixCustomerApi.login(credentials.username, password);
    if (!session) {
      throw new Error('Failed to get session context');
    }
    let customerCartId: string | undefined;
    if (oldSession) {
      try {
        const siteCode = oldSession.siteCode || 'main';

        // Use the cart ID directly from the old session (with service scope via checkSession=false)
        // instead of searching by criteria. After login, the session token has switched to the
        // customer token, whose legalEntityId filter prevents finding anonymous carts via criteria search.
        const oldCartId = oldSession.cartId;
        const oldCart = oldCartId ? await this.cartService.getCartById(oldCartId, false) : null;
        // Only merge carts if the old cart is anonymous and has items
        if (oldCart && !oldCart.customerId && oldCart.items?.length > 0 && session.customerId) {
          const currency = session.currency ?? oldCart.currency;
          const customerCart = await this.cartService.getCart();

          if (!customerCart) {
            customerCartId = await this.cartService.createCart(currency, siteCode);
          } else {
            customerCartId = customerCart.id;
          }

          const targetCurrency = customerCart?.currency ?? currency;

          // Align anonymous cart currency to match customer cart before merge
          if (oldCart.currency !== targetCurrency) {
            try {
              await this.cartService.updateCurrency(oldCart.id, targetCurrency);
            } catch (currencyError) {
              // updateCurrency does changeCurrency + refreshCart. For anonymous carts with a
              // customer session token, the changeCurrency succeeds but refreshCart fails with
              // "Anonymous cart cannot be assigned to a legal entity" (B2B legalEntityId filter).
              // Since changeCurrency already succeeded, we can safely proceed with the merge —
              // the refresh is not needed before merge (the customer cart gets its own refresh).
              const isRefreshOnlyError =
                currencyError instanceof Error &&
                currencyError.message.includes('Anonymous cart cannot be assigned to a legal entity');

              if (!isRefreshOnlyError) {
                // Actual currency change failed — abort merge, switch to customer cart
                this.logger.error(
                  {
                    err: currencyError instanceof Error ? currencyError : String(currencyError),
                    anonymousCartId: oldCart.id,
                    customerCartId,
                    anonymousCurrency: oldCart.currency,
                    targetCurrency,
                  },
                  'Failed to change anonymous cart currency, switching to customer cart without merge',
                );
                await this.sessionService.setCart(customerCartId!);
                return {
                  sessionId: session.sessionId,
                  customerId: session.customerId,
                  siteCode: session.siteCode,
                  currency: session.currency,
                  cartId: customerCartId,
                  country: session.targetLocation,
                };
              }

              // Currency was changed but refresh failed — safe to proceed with merge
              this.logger.info(
                { anonymousCartId: oldCart.id, customerCartId, targetCurrency },
                'Anonymous cart currency aligned but refresh skipped (B2B session context) — continuing with merge',
              );
            }
          }

          try {
            await this.cartMigrationService.mergeCarts(oldCart.id, customerCartId!);
            await this.sessionService.setCart(customerCartId!);
          } catch (mergeError) {
            this.logger.error(
              {
                err: mergeError instanceof Error ? mergeError : String(mergeError),
                oldCartId: oldCart.id,
                customerCartId,
              },
              'Failed to merge carts during login',
            );
            await this.sessionService.setCart(customerCartId!);
          }
        }
      } catch (error) {
        this.logger.error(
          { err: error instanceof Error ? error : String(error) },
          'Cart transition failed during login, continuing without merge',
        );
      }
    }

    return {
      sessionId: session.sessionId,
      customerId: session.customerId,
      siteCode: session.siteCode,
      currency: session.currency,
      cartId: customerCartId,
      country: session.targetLocation,
    };
  }

  async logout(): Promise<void> {
    await this.emporixCustomerApi.logout();
  }

  async register(registration: Registration): Promise<Session> {
    if (!registration.credentials.password) {
      throw new Error('Missing Password');
    }
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
    if (address && registration.address?.tags) {
      address.tags = registration.address.tags;
    }
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
      return null;
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

  private generateSsoPassword(username: string): string {
    const secret = process.env.NEXT_SSO_PASSWORD_SECRET;

    if (!secret) {
      throw new Error('NEXT_SSO_PASSWORD_SECRET environment variable is not configured');
    }

    const combined = secret + username;
    const hash = crypto.createHash('sha256').update(combined).digest('hex');

    return hash;
  }
}

export default EmporixAuthService;
