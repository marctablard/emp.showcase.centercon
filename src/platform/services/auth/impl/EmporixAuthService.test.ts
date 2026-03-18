import { Container } from 'inversify';
import type { EmporixSessionContext } from '@/platform/integrations/emporix/model/session-context';
import type { CartMigrationService } from '@/platform/services/cart/CartMigrationService';
import type { CartService } from '@/platform/services/cart/CartService';
import type { LoggerService } from '@/platform/services/logger/LoggerService';
import type { Cart } from '@/platform/services/model/cart/cart';
import type { Session as ServiceSession } from '@/platform/services/model/session/session';
import type { SessionService } from '@/platform/services/session/SessionService';
import { EmporixAuthService } from './EmporixAuthService';

describe('EmporixAuthService', () => {
  let container: Container;
  let authService: EmporixAuthService;

  let mockSessionContextApi: { getOwnSessionContext: jest.Mock };
  let mockCustomerApi: { login: jest.Mock; logout: jest.Mock };
  let mockAddressMapper: { mapToSource: jest.Mock };
  let mockCartMigrationService: jest.Mocked<CartMigrationService>;
  let mockSessionService: jest.Mocked<SessionService>;
  let mockCartService: jest.Mocked<CartService>;
  let mockLogger: jest.Mocked<LoggerService>;

  const credentials = { username: 'test@example.com', password: 'password123' };

  const loginSessionContext: EmporixSessionContext = {
    sessionId: 'customer-session-id',
    customerId: 'customer-123',
    siteCode: 'main',
    currency: 'EUR',
    targetLocation: 'DE',
  };

  const oldServiceSession: ServiceSession = {
    id: 'anon-session-id',
    siteCode: 'main',
    currency: 'EUR',
    cartId: 'anon-cart-id',
  };

  const anonymousCart: Cart = {
    id: 'anon-cart-id',
    currency: 'EUR',
    site: 'main',
    items: [
      {
        id: 'item-1',
        product: { id: 'prod-1', name: 'Test Product', description: '', purchasable: true },
        quantity: 2,
        price: { amount: 10, currency: 'EUR' },
      },
    ],
    shippingCosts: { amount: 0, currency: 'EUR' },
    totalPrice: { amount: 20, currency: 'EUR' },
    subTotalPrice: { amount: 20, currency: 'EUR' },
    tax: { amount: 0, currency: 'EUR', netValue: 0, grossValue: 0 },
  };

  const customerCart: Cart = {
    id: 'customer-cart-id',
    currency: 'EUR',
    site: 'main',
    customerId: 'customer-123',
    items: [],
    shippingCosts: { amount: 0, currency: 'EUR' },
    totalPrice: { amount: 0, currency: 'EUR' },
    subTotalPrice: { amount: 0, currency: 'EUR' },
    tax: { amount: 0, currency: 'EUR', netValue: 0, grossValue: 0 },
  };

  beforeEach(() => {
    container = new Container();

    mockSessionContextApi = {
      getOwnSessionContext: jest.fn(),
    };

    mockCustomerApi = {
      login: jest.fn(),
      logout: jest.fn(),
    };

    mockAddressMapper = {
      mapToSource: jest.fn(),
    };

    mockCartMigrationService = {
      mergeCarts: jest.fn(),
    };

    mockSessionService = {
      getCurrent: jest.fn(),
      getById: jest.fn(),
      setLanguage: jest.fn(),
      setCurrency: jest.fn(),
      setCountry: jest.fn(),
      setSite: jest.fn(),
      setRegion: jest.fn(),
      setCart: jest.fn(),
    };

    mockCartService = {
      createCart: jest.fn(),
      getCart: jest.fn(),
      getCartById: jest.fn(),
      addItemToCart: jest.fn(),
      updateCartItemQuantity: jest.fn(),
      removeCartItem: jest.fn(),
      deleteCart: jest.fn(),
      updateShippingInfo: jest.fn(),
      updateCurrency: jest.fn(),
      updateSite: jest.fn(),
      getSavedCarts: jest.fn(),
      saveCart: jest.fn(),
      loadCart: jest.fn(),
      getCartByCriteria: jest.fn(),
    };

    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
      fatal: jest.fn(),
      child: jest.fn().mockReturnThis(),
    } as unknown as jest.Mocked<LoggerService>;

    container.bind('EmporixSessionContextApi').toConstantValue(mockSessionContextApi);
    container.bind('EmporixCustomerApi').toConstantValue(mockCustomerApi);
    container.bind('EmporixAddressMapper').toConstantValue(mockAddressMapper);
    container.bind('CartMigrationService').toConstantValue(mockCartMigrationService);
    container.bind('SessionService').toConstantValue(mockSessionService);
    container.bind('CartService').toConstantValue(mockCartService);
    container.bind('LoggerService').toConstantValue(mockLogger);
    container.bind<EmporixAuthService>('AuthService').to(EmporixAuthService);

    authService = container.get<EmporixAuthService>('AuthService');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login - cart merge flow', () => {
    it('should merge anonymous cart into new customer cart when anonymous cart has items and no customer cart exists', async () => {
      mockSessionService.getCurrent.mockResolvedValue(oldServiceSession);
      mockCustomerApi.login.mockResolvedValue(loginSessionContext);
      mockCartService.getCartById.mockResolvedValue(anonymousCart);
      mockCartService.getCart.mockResolvedValue(null);
      mockCartService.createCart.mockResolvedValue('new-customer-cart-id');
      mockCartMigrationService.mergeCarts.mockResolvedValue(undefined);
      mockSessionService.setCart.mockResolvedValue(undefined);

      const result = await authService.login(credentials);

      expect(mockCartService.getCartById).toHaveBeenCalledWith('anon-cart-id', false);
      expect(mockCartService.createCart).toHaveBeenCalledWith('EUR', 'main');
      expect(mockCartMigrationService.mergeCarts).toHaveBeenCalledWith('anon-cart-id', 'new-customer-cart-id');
      expect(mockSessionService.setCart).toHaveBeenCalledWith('new-customer-cart-id');
      expect(result.cartId).toBe('new-customer-cart-id');
    });

    it('should merge anonymous cart into existing customer cart when both carts exist', async () => {
      mockSessionService.getCurrent.mockResolvedValue(oldServiceSession);
      mockCustomerApi.login.mockResolvedValue(loginSessionContext);
      mockCartService.getCartById.mockResolvedValue(anonymousCart);
      mockCartService.getCart.mockResolvedValue(customerCart);
      mockCartMigrationService.mergeCarts.mockResolvedValue(undefined);
      mockSessionService.setCart.mockResolvedValue(undefined);

      const result = await authService.login(credentials);

      expect(mockCartService.createCart).not.toHaveBeenCalled();
      expect(mockCartMigrationService.mergeCarts).toHaveBeenCalledWith('anon-cart-id', 'customer-cart-id');
      expect(mockSessionService.setCart).toHaveBeenCalledWith('customer-cart-id');
      expect(result.cartId).toBe('customer-cart-id');
    });

    it('should not merge when anonymous cart has no items', async () => {
      const emptyAnonymousCart: Cart = { ...anonymousCart, items: [] };
      mockSessionService.getCurrent.mockResolvedValue(oldServiceSession);
      mockCustomerApi.login.mockResolvedValue(loginSessionContext);
      mockCartService.getCartById.mockResolvedValue(emptyAnonymousCart);

      const result = await authService.login(credentials);

      expect(mockCartService.getCart).not.toHaveBeenCalled();
      expect(mockCartMigrationService.mergeCarts).not.toHaveBeenCalled();
      expect(result.cartId).toBeUndefined();
    });

    it('should not merge when no anonymous cart exists', async () => {
      mockSessionService.getCurrent.mockResolvedValue(oldServiceSession);
      mockCustomerApi.login.mockResolvedValue(loginSessionContext);
      mockCartService.getCartById.mockResolvedValue(null);

      const result = await authService.login(credentials);

      expect(mockCartService.getCart).not.toHaveBeenCalled();
      expect(mockCartMigrationService.mergeCarts).not.toHaveBeenCalled();
      expect(result.cartId).toBeUndefined();
    });

    it('should not merge when old session has no cartId', async () => {
      const sessionWithoutCart: ServiceSession = { ...oldServiceSession, cartId: undefined };
      mockSessionService.getCurrent.mockResolvedValue(sessionWithoutCart);
      mockCustomerApi.login.mockResolvedValue(loginSessionContext);

      const result = await authService.login(credentials);

      expect(mockCartService.getCartById).not.toHaveBeenCalled();
      expect(mockCartMigrationService.mergeCarts).not.toHaveBeenCalled();
      expect(result.cartId).toBeUndefined();
    });

    it('should change anonymous cart currency and merge when currencies differ', async () => {
      const usdAnonymousCart: Cart = { ...anonymousCart, currency: 'USD' };
      const eurCustomerCart: Cart = { ...customerCart, currency: 'EUR' };

      mockSessionService.getCurrent.mockResolvedValue(oldServiceSession);
      mockCustomerApi.login.mockResolvedValue(loginSessionContext);
      mockCartService.getCartById.mockResolvedValue(usdAnonymousCart);
      mockCartService.getCart.mockResolvedValue(eurCustomerCart);
      mockCartService.updateCurrency.mockResolvedValue(undefined);
      mockCartMigrationService.mergeCarts.mockResolvedValue(undefined);
      mockSessionService.setCart.mockResolvedValue(undefined);

      const result = await authService.login(credentials);

      expect(mockCartService.updateCurrency).toHaveBeenCalledWith('anon-cart-id', 'EUR');
      expect(mockCartMigrationService.mergeCarts).toHaveBeenCalledWith('anon-cart-id', 'customer-cart-id');
      expect(mockSessionService.setCart).toHaveBeenCalledWith('customer-cart-id');
      expect(result.cartId).toBe('customer-cart-id');
    });

    it('should update session with customer cart ID after successful merge', async () => {
      mockSessionService.getCurrent.mockResolvedValue(oldServiceSession);
      mockCustomerApi.login.mockResolvedValue(loginSessionContext);
      mockCartService.getCartById.mockResolvedValue(anonymousCart);
      mockCartService.getCart.mockResolvedValue(customerCart);
      mockCartMigrationService.mergeCarts.mockResolvedValue(undefined);
      mockSessionService.setCart.mockResolvedValue(undefined);

      await authService.login(credentials);

      expect(mockSessionService.setCart).toHaveBeenCalledWith('customer-cart-id');
    });

    it('should return correct cartId in session after merge', async () => {
      mockSessionService.getCurrent.mockResolvedValue(oldServiceSession);
      mockCustomerApi.login.mockResolvedValue(loginSessionContext);
      mockCartService.getCartById.mockResolvedValue(anonymousCart);
      mockCartService.getCart.mockResolvedValue(null);
      mockCartService.createCart.mockResolvedValue('created-cart-id');
      mockCartMigrationService.mergeCarts.mockResolvedValue(undefined);
      mockSessionService.setCart.mockResolvedValue(undefined);

      const result = await authService.login(credentials);

      expect(result.cartId).toBe('created-cart-id');
      expect(result.customerId).toBe('customer-123');
      expect(result.sessionId).toBe('customer-session-id');
    });

    it('should handle merge failure gracefully, switch to customer cart and still return session', async () => {
      mockSessionService.getCurrent.mockResolvedValue(oldServiceSession);
      mockCustomerApi.login.mockResolvedValue(loginSessionContext);
      mockCartService.getCartById.mockResolvedValue(anonymousCart);
      mockCartService.getCart.mockResolvedValue(customerCart);
      mockCartMigrationService.mergeCarts.mockRejectedValue(new Error('Merge API error'));
      mockSessionService.setCart.mockResolvedValue(undefined);

      const result = await authService.login(credentials);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          err: expect.any(Error),
          oldCartId: 'anon-cart-id',
          customerCartId: 'customer-cart-id',
        }),
        'Failed to merge carts during login',
      );
      expect(mockSessionService.setCart).toHaveBeenCalledWith('customer-cart-id');
      expect(result.sessionId).toBe('customer-session-id');
      expect(result.customerId).toBe('customer-123');
      expect(result.cartId).toBe('customer-cart-id');
    });

    it('should fall back to customer cart when changeCurrency fails with non-refresh error', async () => {
      const gbpAnonymousCart: Cart = { ...anonymousCart, currency: 'GBP' };
      mockSessionService.getCurrent.mockResolvedValue(oldServiceSession);
      mockCustomerApi.login.mockResolvedValue(loginSessionContext);
      mockCartService.getCartById.mockResolvedValue(gbpAnonymousCart);
      mockCartService.getCart.mockResolvedValue(customerCart);
      mockCartService.updateCurrency.mockRejectedValue(new Error('Currency change failed'));
      mockSessionService.setCart.mockResolvedValue(undefined);

      const result = await authService.login(credentials);

      expect(mockCartService.updateCurrency).toHaveBeenCalledWith('anon-cart-id', 'EUR');
      expect(mockCartMigrationService.mergeCarts).not.toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          err: expect.any(Error),
          anonymousCartId: 'anon-cart-id',
          customerCartId: 'customer-cart-id',
          anonymousCurrency: 'GBP',
          targetCurrency: 'EUR',
        }),
        'Failed to change anonymous cart currency, switching to customer cart without merge',
      );
      expect(mockSessionService.setCart).toHaveBeenCalledWith('customer-cart-id');
      expect(result.sessionId).toBe('customer-session-id');
      expect(result.customerId).toBe('customer-123');
      expect(result.cartId).toBe('customer-cart-id');
    });

    it('should continue with merge when updateCurrency fails with legalEntityId refresh error', async () => {
      const usdAnonymousCart: Cart = { ...anonymousCart, currency: 'USD' };
      mockSessionService.getCurrent.mockResolvedValue(oldServiceSession);
      mockCustomerApi.login.mockResolvedValue(loginSessionContext);
      mockCartService.getCartById.mockResolvedValue(usdAnonymousCart);
      mockCartService.getCart.mockResolvedValue(customerCart);
      mockCartService.updateCurrency.mockRejectedValue(
        new Error(
          'Failed to refresh cart: Bad Request {"message":"Anonymous cart cannot be assigned to a legal entity: xyz"}',
        ),
      );
      mockCartMigrationService.mergeCarts.mockResolvedValue(undefined);
      mockSessionService.setCart.mockResolvedValue(undefined);

      const result = await authService.login(credentials);

      // Currency change succeeded but refresh failed — should still merge
      expect(mockCartService.updateCurrency).toHaveBeenCalledWith('anon-cart-id', 'EUR');
      expect(mockCartMigrationService.mergeCarts).toHaveBeenCalledWith('anon-cart-id', 'customer-cart-id');
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          anonymousCartId: 'anon-cart-id',
          customerCartId: 'customer-cart-id',
          targetCurrency: 'EUR',
        }),
        expect.stringContaining('refresh skipped'),
      );
      expect(mockSessionService.setCart).toHaveBeenCalledWith('customer-cart-id');
      expect(result.cartId).toBe('customer-cart-id');
    });

    it('should fall back to customer cart when merge fails after successful currency change', async () => {
      const gbpAnonymousCart: Cart = { ...anonymousCart, currency: 'GBP' };
      mockSessionService.getCurrent.mockResolvedValue(oldServiceSession);
      mockCustomerApi.login.mockResolvedValue(loginSessionContext);
      mockCartService.getCartById.mockResolvedValue(gbpAnonymousCart);
      mockCartService.getCart.mockResolvedValue(customerCart);
      mockCartService.updateCurrency.mockResolvedValue(undefined);
      mockCartMigrationService.mergeCarts.mockRejectedValue(new Error('Merge failed'));
      mockSessionService.setCart.mockResolvedValue(undefined);

      const result = await authService.login(credentials);

      expect(mockCartService.updateCurrency).toHaveBeenCalledWith('anon-cart-id', 'EUR');
      expect(mockCartMigrationService.mergeCarts).toHaveBeenCalledWith('anon-cart-id', 'customer-cart-id');
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          err: expect.any(Error),
          oldCartId: 'anon-cart-id',
          customerCartId: 'customer-cart-id',
        }),
        'Failed to merge carts during login',
      );
      expect(mockSessionService.setCart).toHaveBeenCalledWith('customer-cart-id');
      expect(result.sessionId).toBe('customer-session-id');
      expect(result.customerId).toBe('customer-123');
      expect(result.cartId).toBe('customer-cart-id');
    });

    it('should not call updateCurrency when currencies already match', async () => {
      mockSessionService.getCurrent.mockResolvedValue(oldServiceSession);
      mockCustomerApi.login.mockResolvedValue(loginSessionContext);
      mockCartService.getCartById.mockResolvedValue(anonymousCart); // EUR
      mockCartService.getCart.mockResolvedValue(customerCart); // EUR
      mockCartMigrationService.mergeCarts.mockResolvedValue(undefined);
      mockSessionService.setCart.mockResolvedValue(undefined);

      await authService.login(credentials);

      expect(mockCartService.updateCurrency).not.toHaveBeenCalled();
      expect(mockCartMigrationService.mergeCarts).toHaveBeenCalledWith('anon-cart-id', 'customer-cart-id');
      expect(mockSessionService.setCart).toHaveBeenCalledWith('customer-cart-id');
    });

    it('should not merge when old session does not exist', async () => {
      mockSessionService.getCurrent.mockResolvedValue(undefined);
      mockCustomerApi.login.mockResolvedValue(loginSessionContext);

      const result = await authService.login(credentials);

      expect(mockCartService.getCartById).not.toHaveBeenCalled();
      expect(mockCartMigrationService.mergeCarts).not.toHaveBeenCalled();
      expect(result.cartId).toBeUndefined();
    });

    it('should not merge when cart already belongs to a customer', async () => {
      const customerOwnedCart: Cart = { ...anonymousCart, customerId: 'some-customer' };
      mockSessionService.getCurrent.mockResolvedValue(oldServiceSession);
      mockCustomerApi.login.mockResolvedValue(loginSessionContext);
      mockCartService.getCartById.mockResolvedValue(customerOwnedCart);

      const result = await authService.login(credentials);

      expect(mockCartService.getCart).not.toHaveBeenCalled();
      expect(mockCartMigrationService.mergeCarts).not.toHaveBeenCalled();
      expect(result.cartId).toBeUndefined();
    });

    it('should handle getCartById failure gracefully and still return session', async () => {
      mockSessionService.getCurrent.mockResolvedValue(oldServiceSession);
      mockCustomerApi.login.mockResolvedValue(loginSessionContext);
      mockCartService.getCartById.mockRejectedValue(new Error('Cart API error'));

      const result = await authService.login(credentials);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({ err: expect.any(Error) }),
        'Cart transition failed during login, continuing without merge',
      );
      expect(mockCartMigrationService.mergeCarts).not.toHaveBeenCalled();
      expect(result.sessionId).toBe('customer-session-id');
      expect(result.customerId).toBe('customer-123');
    });

    it('should handle createCart failure gracefully and still return session', async () => {
      mockSessionService.getCurrent.mockResolvedValue(oldServiceSession);
      mockCustomerApi.login.mockResolvedValue(loginSessionContext);
      mockCartService.getCartById.mockResolvedValue(anonymousCart);
      mockCartService.getCart.mockResolvedValue(null);
      mockCartService.createCart.mockRejectedValue(new Error('Create cart failed'));

      const result = await authService.login(credentials);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({ err: expect.any(Error) }),
        'Cart transition failed during login, continuing without merge',
      );
      expect(mockCartMigrationService.mergeCarts).not.toHaveBeenCalled();
      expect(result.sessionId).toBe('customer-session-id');
      expect(result.customerId).toBe('customer-123');
    });

    it('should use anonymous cart currency when session currency is undefined', async () => {
      const noCurrencySession: EmporixSessionContext = {
        ...loginSessionContext,
        currency: undefined,
      };
      mockSessionService.getCurrent.mockResolvedValue(oldServiceSession);
      mockCustomerApi.login.mockResolvedValue(noCurrencySession);
      mockCartService.getCartById.mockResolvedValue(anonymousCart);
      mockCartService.getCart.mockResolvedValue(null);
      mockCartService.createCart.mockResolvedValue('new-cart-id');
      mockCartMigrationService.mergeCarts.mockResolvedValue(undefined);
      mockSessionService.setCart.mockResolvedValue(undefined);

      await authService.login(credentials);

      // Should use anonymousCart.currency ('EUR') as fallback
      expect(mockCartService.createCart).toHaveBeenCalledWith('EUR', 'main');
      expect(mockCartMigrationService.mergeCarts).toHaveBeenCalled();
    });
  });
});
