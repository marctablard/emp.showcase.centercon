import crypto from 'crypto';
import { inject } from 'inversify';
import { injectable } from '@/platform/core/di/injectable';
import EmporixCustomerApi from '@/platform/integrations/emporix/customer/impl/EmporixCustomerApi';
import { EmporixAddress } from '@/platform/integrations/emporix/model';
import { EmporixCustomer } from '@/platform/integrations/emporix/model/customer';
import { EmporixSessionContext } from '@/platform/integrations/emporix/model/session-context';
import EmporixSessionContextApi from '@/platform/integrations/emporix/session/impl/EmporixSessionContextApi';
import { CART_CURRENCY_UPDATE_ERROR_CODE, CartCurrencyUpdateError } from '@/platform/services/cart/errors';
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
  private readonly CART_MERGE_STATUS = {
    MERGED: 'MERGED',
    FALLBACK: 'FALLBACK',
    NOT_APPLICABLE: 'NOT_APPLICABLE',
  } as const;

  private readonly CART_MERGE_REASON = {
    ANONYMOUS_CART_NOT_ELIGIBLE: 'ANONYMOUS_CART_NOT_ELIGIBLE',
    TARGET_CART_UNAVAILABLE: 'TARGET_CART_UNAVAILABLE',
    UNSUPPORTED_CURRENCY: 'UNSUPPORTED_CURRENCY',
    CURRENCY_ALIGNMENT_FAILED: 'CURRENCY_ALIGNMENT_FAILED',
    MERGE_FAILED: 'MERGE_FAILED',
    TRANSITION_FAILED: 'TRANSITION_FAILED',
  } as const;

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
    let cartMergeStatus: Session['cartMergeStatus'] = this.CART_MERGE_STATUS.NOT_APPLICABLE;
    let cartMergeReason: Session['cartMergeReason'] | undefined;
    if (oldSession) {
      try {
        const targetSiteCode = session.siteCode || oldSession.siteCode || 'main';

        // Use the cart ID directly from the old session (with service scope via checkSession=false)
        // instead of searching by criteria. After login, the session token has switched to the
        // customer token, whose legalEntityId filter prevents finding anonymous carts via criteria search.
        const oldCartId = oldSession.cartId;
        const oldCart = oldCartId ? await this.cartService.getCartById(oldCartId, false) : null;
        // Only merge carts if the old cart is anonymous and has items
        if (oldCart && !oldCart.customerId && oldCart.items?.length > 0 && session.customerId) {
          const targetCurrency = session.currency ?? oldCart.currency;
          const customerCart = await this.cartService.getCart();

          if (!customerCart) {
            customerCartId = await this.cartService.createCart(targetCurrency, targetSiteCode);
          } else {
            customerCartId = customerCart.id;
          }

          const mergeCurrency = customerCart?.currency ?? targetCurrency;

          // Align anonymous cart currency to match customer cart before merge
          if (oldCart.currency !== mergeCurrency) {
            try {
              await this.cartService.updateCurrency(oldCart.id, mergeCurrency);
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
                cartMergeStatus = this.CART_MERGE_STATUS.FALLBACK;
                cartMergeReason = this.mapCurrencyAlignmentFailure(currencyError);
                this.logger.error(
                  {
                    err: currencyError instanceof Error ? currencyError : String(currencyError),
                    anonymousCartId: oldCart.id,
                    customerCartId,
                    anonymousCurrency: oldCart.currency,
                    targetCurrency: mergeCurrency,
                    cartMergeReason,
                  },
                  'Failed to change anonymous cart currency, switching to customer cart without merge',
                );
                await this.sessionService.setCart(customerCartId!);
                return this.buildLoginResult(session, customerCartId, cartMergeStatus, cartMergeReason);
              }

              // Currency was changed but refresh failed — safe to proceed with merge
              this.logger.info(
                { anonymousCartId: oldCart.id, customerCartId, targetCurrency: mergeCurrency },
                'Anonymous cart currency aligned but refresh skipped (B2B session context) — continuing with merge',
              );
            }
          }

          try {
            await this.cartMigrationService.mergeCarts(oldCart.id, customerCartId!);
            await this.sessionService.setCart(customerCartId!);
            cartMergeStatus = this.CART_MERGE_STATUS.MERGED;
          } catch (mergeError) {
            cartMergeStatus = this.CART_MERGE_STATUS.FALLBACK;
            cartMergeReason = this.CART_MERGE_REASON.MERGE_FAILED;
            this.logger.error(
              {
                err: mergeError instanceof Error ? mergeError : String(mergeError),
                oldCartId: oldCart.id,
                customerCartId,
                cartMergeReason,
              },
              'Failed to merge carts during login',
            );
            await this.sessionService.setCart(customerCartId!);
          }
        } else {
          cartMergeStatus = this.CART_MERGE_STATUS.NOT_APPLICABLE;
          cartMergeReason = this.CART_MERGE_REASON.ANONYMOUS_CART_NOT_ELIGIBLE;
        }

        if (session.customerId && cartMergeStatus !== this.CART_MERGE_STATUS.MERGED) {
          customerCartId = await this.safeEnsureCustomerCartBinding(
            session.customerId,
            targetSiteCode,
            session.currency,
            customerCartId,
          );
          if (customerCartId) {
            await this.sessionService.setCart(customerCartId);
          }
        }
      } catch (error) {
        cartMergeStatus = this.CART_MERGE_STATUS.FALLBACK;
        cartMergeReason = this.CART_MERGE_REASON.TRANSITION_FAILED;
        this.logger.error(
          { err: error instanceof Error ? error : String(error), cartMergeReason },
          'Cart transition failed during login, continuing without merge',
        );
        if (session.customerId) {
          const targetSiteCode = session.siteCode || oldSession.siteCode || 'main';
          customerCartId = await this.safeEnsureCustomerCartBinding(
            session.customerId,
            targetSiteCode,
            session.currency,
            customerCartId,
          );
          if (customerCartId) {
            await this.sessionService.setCart(customerCartId);
          }
        }
      }
    }

    if (session.customerId && !customerCartId) {
      const targetSiteCode = session.siteCode || oldSession?.siteCode || 'main';
      customerCartId = await this.safeEnsureCustomerCartBinding(
        session.customerId,
        targetSiteCode,
        session.currency,
        customerCartId,
      );
      if (customerCartId) {
        await this.sessionService.setCart(customerCartId);
      }
    }

    return this.buildLoginResult(session, customerCartId, cartMergeStatus, cartMergeReason);
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

  private mapCurrencyAlignmentFailure(error: unknown): Session['cartMergeReason'] {
    if (error instanceof CartCurrencyUpdateError) {
      if (error.code === CART_CURRENCY_UPDATE_ERROR_CODE.UNSUPPORTED_CURRENCY) {
        return this.CART_MERGE_REASON.UNSUPPORTED_CURRENCY;
      }
    }
    return this.CART_MERGE_REASON.CURRENCY_ALIGNMENT_FAILED;
  }

  private buildLoginResult(
    session: EmporixSessionContext,
    cartId: string | undefined,
    cartMergeStatus: Session['cartMergeStatus'],
    cartMergeReason?: Session['cartMergeReason'],
  ): Session {
    return {
      sessionId: session.sessionId,
      customerId: session.customerId,
      siteCode: session.siteCode,
      currency: session.currency,
      cartId,
      country: session.targetLocation,
      cartMergeStatus,
      cartMergeReason,
    };
  }

  private async ensureCustomerCartBinding(
    customerId: string,
    siteCode: string,
    currency?: string,
    preferredCartId?: string,
  ): Promise<string> {
    if (preferredCartId) {
      const preferredCart = await this.cartService.getCartById(preferredCartId, false);
      if (preferredCart?.customerId === customerId) {
        return preferredCartId;
      }
    }

    const existingCustomerCart = await this.cartService.getCart();
    if (existingCustomerCart?.customerId === customerId) {
      return existingCustomerCart.id;
    }

    return this.cartService.createCart(currency || 'EUR', siteCode);
  }

  private async safeEnsureCustomerCartBinding(
    customerId: string,
    siteCode: string,
    currency?: string,
    preferredCartId?: string,
  ): Promise<string | undefined> {
    try {
      return await this.ensureCustomerCartBinding(customerId, siteCode, currency, preferredCartId);
    } catch (error) {
      this.logger.error(
        {
          err: error instanceof Error ? error : String(error),
          customerId,
          siteCode,
          preferredCartId,
        },
        'Failed to ensure customer cart binding',
      );
      return preferredCartId;
    }
  }
}

export default EmporixAuthService;
