import { Container } from 'inversify';
import 'reflect-metadata';
import type { EmporixCartApi } from '@/platform/integrations/emporix/cart/EmporixCartApi';
import type { EmporixCart } from '@/platform/integrations/emporix/model/cart';
import type { LoggerService } from '@/platform/services/logger/LoggerService';
import type { SessionService } from '@/platform/services/session/SessionService';
import type { SiteService } from '@/platform/services/site/SiteService';
import EmporixCartService from './EmporixCartService';

describe('EmporixCartService', () => {
  let container: Container;
  let cartService: EmporixCartService;

  let mockCartApi: jest.Mocked<Pick<EmporixCartApi, 'getCart' | 'updateCart' | 'refreshCart' | 'changeCurrency'>>;
  let mockLogger: jest.Mocked<LoggerService>;
  let mockSessionService: jest.Mocked<Pick<SessionService, 'getCurrent'>>;
  let mockSiteService: jest.Mocked<Pick<SiteService, 'getSite'>>;

  // Minimal stubs for unused dependencies
  const noop = {} as Record<string, jest.Mock>;

  const mainSite = {
    code: 'main',
    currencies: [
      { code: 'EUR', id: 'EUR' },
      { code: 'USD', id: 'USD' },
    ],
  };

  beforeEach(() => {
    container = new Container();

    mockCartApi = {
      getCart: jest.fn(),
      updateCart: jest.fn().mockResolvedValue(undefined),
      refreshCart: jest.fn().mockResolvedValue(undefined),
      changeCurrency: jest.fn().mockResolvedValue(undefined),
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

    mockSessionService = {
      getCurrent: jest.fn().mockResolvedValue(null),
    };

    mockSiteService = {
      getSite: jest.fn().mockResolvedValue(mainSite),
    };

    container.bind('EmporixCommonUtil').toConstantValue(noop);
    container.bind('EmporixCartApi').toConstantValue(mockCartApi);
    container.bind('EmporixCartMapper').toConstantValue(noop);
    container.bind('SessionService').toConstantValue(mockSessionService);
    container.bind('PriceService').toConstantValue(noop);
    container.bind('ProductService').toConstantValue(noop);
    container.bind('StockService').toConstantValue(noop);
    container.bind('LoggerService').toConstantValue(mockLogger);
    container.bind('SiteService').toConstantValue(mockSiteService);
    container.bind<EmporixCartService>('CartService').to(EmporixCartService);

    cartService = container.get<EmporixCartService>('CartService');
  });

  describe('updateShippingInfo', () => {
    it('should only send metadata, countryCode, and zipCode to updateCart', async () => {
      const fullCart: EmporixCart = {
        id: 'cart-123',
        yrn: 'yrn:emporix:cart:cart-123',
        customerId: 'customer-456',
        sessionId: 'session-789',
        legalEntityId: 'legal-entity-001',
        currency: 'EUR',
        siteCode: 'main',
        countryCode: 'DE',
        zipCode: '10115',
        status: 'OPEN',
        type: 'shopping',
        items: [
          {
            id: 'item-1',
            itemYrn: 'yrn:product:1',
            product: { id: 'prod-1', name: 'Widget' },
            quantity: 3,
            price: { effectiveAmount: 10, originalAmount: 10, currency: 'EUR' },
          },
        ] as unknown as EmporixCart['items'],
        totalUnitsCount: 3,
        metadata: { version: 5 },
      };

      mockCartApi.getCart.mockResolvedValue(fullCart);

      await cartService.updateShippingInfo('cart-123', 'US', '10001');

      expect(mockCartApi.updateCart).toHaveBeenCalledWith('cart-123', {
        metadata: {
          version: 6,
        },
        countryCode: 'US',
        zipCode: '10001',
      });

      // Verify ownership/read-only fields are NOT sent
      const updatePayload = mockCartApi.updateCart.mock.calls[0][1];
      expect(updatePayload).not.toHaveProperty('id');
      expect(updatePayload).not.toHaveProperty('yrn');
      expect(updatePayload).not.toHaveProperty('customerId');
      expect(updatePayload).not.toHaveProperty('sessionId');
      expect(updatePayload).not.toHaveProperty('legalEntityId');
      expect(updatePayload).not.toHaveProperty('status');
      expect(updatePayload).not.toHaveProperty('items');
      expect(updatePayload).not.toHaveProperty('calculatedPrice');
      expect(updatePayload).not.toHaveProperty('totalUnitsCount');
      expect(updatePayload).not.toHaveProperty('currency');
      expect(updatePayload).not.toHaveProperty('siteCode');
      expect(updatePayload).not.toHaveProperty('type');
      expect(updatePayload).not.toHaveProperty('channel');
    });

    it('should handle cart with no metadata (version starts at 1)', async () => {
      const cartNoMetadata: EmporixCart = {
        id: 'cart-no-meta',
        currency: 'EUR',
        siteCode: 'main',
        metadata: undefined,
      };

      mockCartApi.getCart.mockResolvedValue(cartNoMetadata);

      await cartService.updateShippingInfo('cart-no-meta', 'GB', 'SW1A 1AA');

      expect(mockCartApi.updateCart).toHaveBeenCalledWith('cart-no-meta', {
        metadata: {
          version: 1,
        },
        countryCode: 'GB',
        zipCode: 'SW1A 1AA',
      });
    });

    it('should throw when cart not found', async () => {
      mockCartApi.getCart.mockResolvedValue(null);

      await expect(cartService.updateShippingInfo('missing-cart', 'US', '10001')).rejects.toThrow('Cart not found');

      expect(mockCartApi.updateCart).not.toHaveBeenCalled();
    });

    it('should call refreshCart after successful update', async () => {
      const cart: EmporixCart = {
        id: 'cart-refresh',
        currency: 'EUR',
        siteCode: 'main',
        metadata: { version: 1 },
      };

      mockCartApi.getCart.mockResolvedValue(cart);

      await cartService.updateShippingInfo('cart-refresh', 'FR', '75001');

      expect(mockCartApi.refreshCart).toHaveBeenCalledWith('cart-refresh');
      // refreshCart should be called AFTER updateCart
      const updateOrder = mockCartApi.updateCart.mock.invocationCallOrder[0];
      const refreshOrder = mockCartApi.refreshCart.mock.invocationCallOrder[0];
      expect(refreshOrder).toBeGreaterThan(updateOrder);
    });

    it('should retry refreshCart after clearing orphaned legalEntityId', async () => {
      const cart: EmporixCart = {
        id: 'cart-123',
        currency: 'EUR',
        siteCode: 'main',
        metadata: { version: 1 },
      };
      const freshCart: EmporixCart = {
        id: 'cart-123',
        currency: 'EUR',
        siteCode: 'main',
        metadata: { version: 2 }, // bumped by our shipping updateCart
      };

      mockCartApi.getCart
        .mockResolvedValueOnce(cart) // initial getCart
        .mockResolvedValueOnce(freshCart); // re-fetch inside refreshCartWithCleanup

      mockCartApi.refreshCart
        .mockRejectedValueOnce(
          new Error(
            'Failed to refresh cart: Bad Request {"message":"Anonymous cart cannot be assigned to a legal entity: xyz"}',
          ),
        )
        .mockResolvedValueOnce(undefined); // retry succeeds

      await cartService.updateShippingInfo('cart-123', 'DE', '10115');

      // First updateCart: shipping info; second: legalEntityId cleanup
      expect(mockCartApi.updateCart).toHaveBeenCalledTimes(2);
      expect(mockCartApi.updateCart).toHaveBeenLastCalledWith('cart-123', {
        metadata: { version: 3 },
        legalEntityId: '',
      });
      expect(mockCartApi.refreshCart).toHaveBeenCalledTimes(2);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        { cartId: 'cart-123' },
        expect.stringContaining('orphaned legalEntityId'),
      );
    });
  });

  describe('updateCurrency', () => {
    it('should change currency and refresh cart', async () => {
      const cart: EmporixCart = {
        id: 'cart-1',
        currency: 'USD',
        siteCode: 'main',
        metadata: { version: 1 },
      };

      mockCartApi.getCart.mockResolvedValue(cart);

      await cartService.updateCurrency('cart-1', 'EUR');

      expect(mockCartApi.changeCurrency).toHaveBeenCalledWith('cart-1', 'EUR');
      expect(mockCartApi.refreshCart).toHaveBeenCalledWith('cart-1');
      expect(mockCartApi.updateCart).not.toHaveBeenCalled();
    });

    it('should catch legalEntityId error on refreshCart, clear it, and retry', async () => {
      const cart: EmporixCart = {
        id: 'cart-1',
        currency: 'USD',
        siteCode: 'main',
        metadata: { version: 1 },
      };
      const freshCart: EmporixCart = {
        id: 'cart-1',
        currency: 'EUR',
        siteCode: 'main',
        metadata: { version: 2 }, // bumped by changeCurrency
      };

      mockCartApi.getCart
        .mockResolvedValueOnce(cart) // initial getCart in updateCurrency
        .mockResolvedValueOnce(freshCart); // re-fetch inside refreshCartWithCleanup

      mockCartApi.refreshCart
        .mockRejectedValueOnce(
          new Error(
            'Failed to refresh cart: Bad Request {"code":400,"message":"Anonymous cart cannot be assigned to a legal entity: abc123"}',
          ),
        )
        .mockResolvedValueOnce(undefined); // retry succeeds

      await cartService.updateCurrency('cart-1', 'EUR');

      expect(mockCartApi.changeCurrency).toHaveBeenCalledWith('cart-1', 'EUR');
      // refreshCart called twice: first attempt fails, retry succeeds
      expect(mockCartApi.refreshCart).toHaveBeenCalledTimes(2);
      // updateCart called to clear legalEntityId
      expect(mockCartApi.updateCart).toHaveBeenCalledWith('cart-1', {
        metadata: { version: 3 },
        legalEntityId: '',
      });
      expect(mockLogger.warn).toHaveBeenCalledWith(
        { cartId: 'cart-1' },
        expect.stringContaining('orphaned legalEntityId'),
      );
    });

    it('should re-throw non-legalEntityId refresh errors', async () => {
      const cart: EmporixCart = {
        id: 'cart-1',
        currency: 'USD',
        siteCode: 'main',
        metadata: { version: 1 },
      };

      mockCartApi.getCart.mockResolvedValue(cart);
      mockCartApi.refreshCart.mockRejectedValue(new Error('Failed to refresh cart: Internal Server Error'));

      await expect(cartService.updateCurrency('cart-1', 'EUR')).rejects.toThrow('Internal Server Error');

      expect(mockCartApi.updateCart).not.toHaveBeenCalled();
    });

    it('should throw when currency is not supported by site', async () => {
      const cart: EmporixCart = {
        id: 'cart-1',
        currency: 'USD',
        siteCode: 'main',
      };

      mockCartApi.getCart.mockResolvedValue(cart);

      await expect(cartService.updateCurrency('cart-1', 'GBP')).rejects.toThrow('Currency not supported');

      expect(mockCartApi.changeCurrency).not.toHaveBeenCalled();
    });

    it('should throw when cart not found', async () => {
      mockCartApi.getCart.mockResolvedValue(null);

      await expect(cartService.updateCurrency('missing', 'EUR')).rejects.toThrow('Cart not found');
    });
  });
});
