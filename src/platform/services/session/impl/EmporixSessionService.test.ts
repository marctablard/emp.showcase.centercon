import { Container } from 'inversify';
import EmporixSessionService from './EmporixSessionService';
import type { SessionContextApi } from '@/platform/integrations/emporix/session/SessionContextApi';
import type { SessionContext, ContextAttribute } from '@/platform/integrations/emporix/model/session-context';
import type { Session, SessionAttribute } from '@/platform/services/model/session/session';
import type { SessionMapper } from '@/platform/services/model/session/SessionMapper';
import type { EmporixSessionMapper } from '@/platform/services/model/session/impl/EmporixSessionMapper';
import type { SessionMapper as GenericSessionMapper } from '@/platform/services/model/session/SessionMapper';

describe('EmporixSessionService', () => {
  let container: Container;
  let sessionService: EmporixSessionService;
  let mockSessionContextApi: jest.Mocked<SessionContextApi>;
  let mockSessionMapper: jest.Mocked<EmporixSessionMapper>;
  
  const mockSessionContext: SessionContext = {
    sessionId: 'test-session-id',
    currency: 'USD',
    siteCode: 'test-site',
    context: {
      testAttribute: {
        key: 'testAttribute',
        value: 'test-value'
      }
    }
  };
  
  const mockSession: Session = {
    id: 'test-session-id',
    currency: 'USD',
    siteCode: 'test-site',
    attributes: {
      testAttribute: {
        key: 'testAttribute',
        value: 'test-value'
      }
    }
  };
  
  const mockSessionAttribute: SessionAttribute = {
    key: 'testAttribute',
    value: 'test-value'
  };
  
  const mockContextAttribute: ContextAttribute = {
    key: 'testAttribute',
    value: 'test-value'
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
      removeSessionContextAttribute: jest.fn()
    };
    
    // Create mock for SessionMapper
    mockSessionMapper = {
      mapToService: jest.fn(),
      mapToSource: jest.fn(),
      mapPartialToSource: jest.fn(),
      mapAttributeToSource: jest.fn()
    };
    
    // Register mocks
    container.bind<SessionContextApi>('EmporixSessionContextApi').toConstantValue(mockSessionContextApi);
    container.bind<EmporixSessionMapper>('EmporixSessionMapper').toConstantValue(mockSessionMapper);
    container.bind<EmporixSessionService>('SessionService').to(EmporixSessionService);
    
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
      
      const result = await sessionService.getCurrentSession();
      
      expect(mockSessionContextApi.getOwnSessionContext).toHaveBeenCalledTimes(1);
      expect(mockSessionMapper.mapToService).toHaveBeenCalledWith(mockSessionContext);
      expect(result).toEqual(mockSession);
    });
    
    it('should return undefined when session not found', async () => {
      mockSessionContextApi.getOwnSessionContext.mockResolvedValue(undefined);
      
      const result = await sessionService.getCurrentSession();
      
      expect(mockSessionContextApi.getOwnSessionContext).toHaveBeenCalledTimes(1);
      expect(mockSessionMapper.mapToService).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });

  describe('updateCurrentSession', () => {
    it('should map the session and call updateOwnSessionContext on the SessionContextApi', async () => {
      const partialSession: Partial<Session> = {
        currency: 'EUR',
        siteCode: 'new-site'
      };
      
      const mappedPartialContext: Partial<SessionContext> = {
        currency: 'EUR',
        siteCode: 'new-site'
      };
      
      mockSessionMapper.mapPartialToSource.mockReturnValue(mappedPartialContext);
      mockSessionContextApi.updateOwnSessionContext.mockResolvedValue();
      
      await sessionService.updateCurrentSession(partialSession);
      
      expect(mockSessionMapper.mapPartialToSource).toHaveBeenCalledWith(partialSession);
      expect(mockSessionContextApi.updateOwnSessionContext).toHaveBeenCalledTimes(1);
      expect(mockSessionContextApi.updateOwnSessionContext).toHaveBeenCalledWith(mappedPartialContext);
    });
  });

  describe('addAttributeToCurrentSession', () => {
    it('should map the attribute and call addOwnSessionContextAttribute on the SessionContextApi', async () => {
      mockSessionMapper.mapAttributeToSource.mockReturnValue(mockContextAttribute);
      mockSessionContextApi.addOwnSessionContextAttribute.mockResolvedValue('success');
      
      const result = await sessionService.addAttributeToCurrentSession(mockSessionAttribute);
      
      expect(mockSessionMapper.mapAttributeToSource).toHaveBeenCalledWith(mockSessionAttribute);
      expect(mockSessionContextApi.addOwnSessionContextAttribute).toHaveBeenCalledTimes(1);
      expect(mockSessionContextApi.addOwnSessionContextAttribute).toHaveBeenCalledWith(mockContextAttribute);
      expect(result).toBe('success');
    });
  });

  describe('removeAttributeFromCurrentSession', () => {
    it('should call removeOwnSessionContextAttribute on the SessionContextApi', async () => {
      mockSessionContextApi.removeOwnSessionContextAttribute.mockResolvedValue();
      
      await sessionService.removeAttributeFromCurrentSession('testAttribute');
      
      expect(mockSessionContextApi.removeOwnSessionContextAttribute).toHaveBeenCalledTimes(1);
      expect(mockSessionContextApi.removeOwnSessionContextAttribute).toHaveBeenCalledWith('testAttribute');
    });
  });
});
