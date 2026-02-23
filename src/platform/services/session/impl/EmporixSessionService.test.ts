import { Container } from 'inversify';
import type {
  EmporixContextAttribute,
  EmporixSessionContext,
} from '@/platform/integrations/emporix/model/session-context';
import { EmporixSessionContextApi } from '@/platform/integrations/emporix/session/EmporixSessionContextApi';
import type { LoggerService } from '@/platform/services/logger/LoggerService';
import type { Session, SessionAttribute } from '@/platform/services/model/session/session';
import { SessionMapper } from '../../model/session';
import { SiteService } from '../../site/SiteService';
import EmporixSessionService from './EmporixSessionService';

describe('EmporixSessionService', () => {
  let container: Container;
  let sessionService: EmporixSessionService;
  let mockSessionContextApi: jest.Mocked<EmporixSessionContextApi>;
  let mockSiteService: jest.Mocked<SiteService>;
  let mockSessionMapper: jest.Mocked<SessionMapper<EmporixSessionContext, EmporixContextAttribute>>;

  const mockSessionContext: EmporixSessionContext = {
    sessionId: 'test-session-id',
    currency: 'USD',
    siteCode: 'test-site',
    context: {
      testAttribute: {
        key: 'testAttribute',
        value: 'test-value',
      },
    },
  };

  const mockSession: Session = {
    id: 'test-session-id',
    currency: 'USD',
    siteCode: 'test-site',
    attributes: {
      testAttribute: {
        key: 'testAttribute',
        value: 'test-value',
      },
    },
  };

  const mockSessionAttribute: SessionAttribute = {
    key: 'testAttribute',
    value: 'test-value',
  };

  const mockContextAttribute: EmporixContextAttribute = {
    key: 'testAttribute',
    value: 'test-value',
  };

  beforeEach(() => {
    container = new Container();

    // Create mock for SessionContextApi
    mockSessionContextApi = {
      getOwnSessionContext: jest.fn(),
      updateOwnSessionContext: jest.fn(),
      addOwnSessionContextAttribute: jest.fn(),
      removeOwnSessionContextAttribute: jest.fn(),
      // Add other required methods from the interface
      getSessionContext: jest.fn(),
      updateSessionContext: jest.fn(),
      addSessionContextAttribute: jest.fn(),
      removeSessionContextAttribute: jest.fn(),
    };

    // Create mock for SessionMapper
    mockSessionMapper = {
      mapToService: jest.fn(),
      mapToSource: jest.fn(),
      mapPartialToSource: jest.fn(),
      mapAttributeToSource: jest.fn(),
    };

    mockSiteService = {
      getSite: jest.fn(),
      getAvailableSites: jest.fn(),
      getCountries: jest.fn(),
      getCountry: jest.fn(),
      getRegions: jest.fn(),
      getRegion: jest.fn(),
      getExchangeRates: jest.fn(),
      getExchangeRate: jest.fn(),
      getCurrencies: jest.fn(),
      getCurrency: jest.fn(),
    };

    // Register mocks
    container.bind<EmporixSessionContextApi>('EmporixSessionContextApi').toConstantValue(mockSessionContextApi);
    container
      .bind<SessionMapper<EmporixSessionContext, EmporixContextAttribute>>('EmporixSessionMapper')
      .toConstantValue(mockSessionMapper);
    container.bind<EmporixSessionService>('SessionService').to(EmporixSessionService);
    container.bind<SiteService>('SiteService').toConstantValue(mockSiteService);
    container.bind<LoggerService>('LoggerService').toConstantValue({
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
      fatal: jest.fn(),
      child: jest.fn().mockReturnThis(),
    } as unknown as LoggerService);

    // Get service instance
    sessionService = container.get<EmporixSessionService>('SessionService');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentSession', () => {
    it('should call getOwnSessionContext on the SessionContextApi and map the result', async () => {
      mockSessionContextApi.getOwnSessionContext.mockResolvedValue(mockSessionContext);
      mockSessionMapper.mapToService.mockReturnValue(mockSession);

      const result = await sessionService.getCurrent();

      expect(mockSessionContextApi.getOwnSessionContext).toHaveBeenCalledTimes(1);
      expect(mockSessionMapper.mapToService).toHaveBeenCalledWith(mockSessionContext);
      expect(result).toEqual(mockSession);
    });

    it('should return undefined when session not found', async () => {
      mockSessionContextApi.getOwnSessionContext.mockResolvedValue(undefined);

      const result = await sessionService.getCurrent();

      expect(mockSessionContextApi.getOwnSessionContext).toHaveBeenCalledTimes(1);
      expect(mockSessionMapper.mapToService).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });

  describe('updateCurrentSession', () => {
    it('should map the session and call updateOwnSessionContext on the SessionContextApi', async () => {
      const mappedPartialContext: Partial<EmporixSessionContext> = {
        currency: 'EUR',
        metadata: {
          version: 1,
        },
      };

      mockSessionMapper.mapPartialToSource.mockReturnValue(mappedPartialContext);
      mockSessionContextApi.getOwnSessionContext.mockResolvedValue(mockSessionContext);
      mockSessionContextApi.updateOwnSessionContext.mockResolvedValue();

      await sessionService.setCurrency('EUR');
      expect(mockSessionContextApi.updateOwnSessionContext).toHaveBeenCalledTimes(1);
      expect(mockSessionContextApi.updateOwnSessionContext).toHaveBeenCalledWith(mappedPartialContext);
    });
  });

  describe('addAttributeToCurrentSession', () => {
    it('should map the attribute and call addOwnSessionContextAttribute on the SessionContextApi', async () => {
      const mockSessionAttribute: EmporixContextAttribute = {
        key: 'language',
        value: 'en',
      };
      sessionService.setLanguage('en');
      expect(mockSessionContextApi.addOwnSessionContextAttribute).toHaveBeenCalledTimes(1);
      expect(mockSessionContextApi.addOwnSessionContextAttribute).toHaveBeenCalledWith(mockSessionAttribute);
    });
  });

  describe('setSite', () => {
    it('should clear currentCart and reset currency when site changes with defaultCurrency', async () => {
      // Arrange
      mockSessionContextApi.getOwnSessionContext.mockResolvedValue({
        sessionId: 'test-session',
        siteCode: 'site-a', // Current site
        metadata: { version: 1 },
      });
      mockSessionContextApi.updateOwnSessionContext.mockResolvedValue();
      mockSessionContextApi.removeOwnSessionContextAttribute.mockResolvedValue();

      // Act
      await sessionService.setSite('site-b', 'EUR'); // New site with default currency

      // Assert — single atomic PATCH includes both siteCode and currency
      expect(mockSessionContextApi.updateOwnSessionContext).toHaveBeenCalledWith({
        siteCode: 'site-b',
        currency: 'EUR',
        metadata: { version: 1 },
      });
      expect(mockSessionContextApi.removeOwnSessionContextAttribute).toHaveBeenCalledWith('currentCart');
    });

    it('should NOT include currency in PATCH when site is set to same value', async () => {
      // Arrange
      mockSessionContextApi.getOwnSessionContext.mockResolvedValue({
        sessionId: 'test-session',
        siteCode: 'site-a',
        metadata: { version: 1 },
      });
      mockSessionContextApi.updateOwnSessionContext.mockResolvedValue();

      // Act
      await sessionService.setSite('site-a', 'EUR'); // Same site

      // Assert — currency should NOT be included since site didn't change
      expect(mockSessionContextApi.updateOwnSessionContext).toHaveBeenCalledWith({
        siteCode: 'site-a',
        metadata: { version: 1 },
      });
      expect(mockSessionContextApi.removeOwnSessionContextAttribute).not.toHaveBeenCalled();
    });

    it('should NOT clear currentCart when session has no siteCode set initially', async () => {
      // Arrange - session exists but no siteCode yet (first time setting site)
      mockSessionContextApi.getOwnSessionContext.mockResolvedValue({
        sessionId: 'test-session',
        metadata: { version: 1 },
      });
      mockSessionContextApi.updateOwnSessionContext.mockResolvedValue();

      // Act
      await sessionService.setSite('site-a', 'EUR');

      // Assert — first-time site set: siteChanged is false, so no currency reset
      expect(mockSessionContextApi.updateOwnSessionContext).toHaveBeenCalledWith({
        siteCode: 'site-a',
        metadata: { version: 1 },
      });
      expect(mockSessionContextApi.removeOwnSessionContextAttribute).not.toHaveBeenCalled();
    });

    it('should not update currency when defaultCurrency is not provided (backward compatibility)', async () => {
      // Arrange
      mockSessionContextApi.getOwnSessionContext.mockResolvedValue({
        sessionId: 'test-session',
        siteCode: 'site-a',
        metadata: { version: 1 },
      });
      mockSessionContextApi.updateOwnSessionContext.mockResolvedValue();
      mockSessionContextApi.removeOwnSessionContextAttribute.mockResolvedValue();

      // Act — no defaultCurrency argument
      await sessionService.setSite('site-b');

      // Assert — PATCH only contains siteCode, no currency
      expect(mockSessionContextApi.updateOwnSessionContext).toHaveBeenCalledWith({
        siteCode: 'site-b',
        metadata: { version: 1 },
      });
      expect(mockSessionContextApi.removeOwnSessionContextAttribute).toHaveBeenCalledWith('currentCart');
    });
  });
});
