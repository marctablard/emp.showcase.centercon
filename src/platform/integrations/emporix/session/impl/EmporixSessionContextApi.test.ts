import EmporixSessionContextApi from './EmporixSessionContextApi';
import EmporixApiInvoker from '../../common/impl/EmporixApiInvoker';
import { EmporixSessionContext, EmporixContextAttribute } from '../../model/session-context';
import { EmporixConfig } from '../../config';
import { Container } from 'inversify';
import EmporixOAuthApi from '../../oauth/impl/EmporixOAuthApi';
import { TokenManager } from '../../common/TokenManager';
import { EmporixTestTokenManager } from '../../common/impl/EmporixTokenManager.test';

// Create a test config implementation
class TestEmporixConfig implements EmporixConfig {
  baseUrl: string = process.env.NEXT_EMPORIX_TEST_BASE_URL || 'https://api.emporix.io';
  tenant: string = process.env.NEXT_EMPORIX_TEST_TENANT || 'showcasetest';
  clientId: string = process.env.NEXT_EMPORIX_TEST_CLIENT_ID || '';
  clientSecret: string = process.env.NEXT_EMPORIX_TEST_CLIENT_SECRET || '';
  serverClientId: string = process.env.NEXT_EMPORIX_TEST_SERVER_CLIENT_ID || '';
  serverClientSecret: string = process.env.NEXT_EMPORIX_TEST_SERVER_CLIENT_SECRET || '';
}


// Generate a timestamp to make test data unique
const timestamp = Date.now();

// Function to create a test session context
const createTestSessionContext = (sessionId: string): EmporixSessionContext => ({
  sessionId,
  siteCode: 'test',
  currency: 'EUR',
  targetLocation: 'DE'
});

// Function to create a test context attribute
const createTestAttribute = (key: string): EmporixContextAttribute => ({
  key,
  value: `test-value-${timestamp}`
});

describe('EmporixSessionContextApi', () => {
  let container: Container;
  let sessionContextApi: EmporixSessionContextApi;
  let apiInvoker: EmporixApiInvoker;
  let tokenManager: TokenManager;
  let config: EmporixConfig;

  // Generate a unique session ID for testing
  const testSessionId = `test-session-${Date.now()}`;

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up the container with our test config
    container = new Container();
    container.bind<EmporixConfig>('EmporixConfig').to(TestEmporixConfig);
    container.bind<EmporixOAuthApi>('EmporixOAuthApi').to(EmporixOAuthApi);
    container.bind<TokenManager>('EmporixTokenManager').to(EmporixTestTokenManager);
    container.bind<EmporixApiInvoker>('EmporixApiInvoker').to(EmporixApiInvoker);
    container.bind<EmporixSessionContextApi>('EmporixSessionContextApi').to(EmporixSessionContextApi);
    // enable for debug output as curl
    // container.bind<boolean>('debugCurl').toConstantValue(true);


    // Get instances from the container
    apiInvoker = container.get<EmporixApiInvoker>('EmporixApiInvoker');
    sessionContextApi = container.get<EmporixSessionContextApi>('EmporixSessionContextApi');
    tokenManager = container.get<TokenManager>('EmporixTokenManager');
    config = container.get<EmporixConfig>('EmporixConfig');
    // Spy on the authenticatedFetch method to verify calls
    jest.spyOn(apiInvoker, 'authenticatedFetch');
  });

  describe('getSessionContext', () => {
    it.skip('should fetch a session context by ID', async () => {
      const tokenManager = container.get<TokenManager>("EmporixTokenManager");
      const { accessToken: _token, sessionId } = await tokenManager.getAnonymousToken(config.tenant, config.clientId);

      // Now fetch it
      const result = await sessionContextApi.getSessionContext(sessionId);

      expect(apiInvoker.authenticatedFetch).toHaveBeenCalledWith(
        `/session-context/${config.tenant}/context/${sessionId}`,
        { method: 'GET' }
      );

      expect(result).toBeDefined();
      expect(result?.sessionId).toEqual(testSessionId);
    });

    it.skip('should return undefined when session context is not found', async () => {
      const nonExistentSessionId = 'non-existent-session-' + Date.now();

      const result = await sessionContextApi.getSessionContext(nonExistentSessionId);

      expect(apiInvoker.authenticatedFetch).toHaveBeenCalledWith(
        `/session-context/${config.tenant}/context/${nonExistentSessionId}`,
        { method: 'GET' }
      );

      expect(result).toBeUndefined();
    });
  });

  describe('updateSessionContext', () => {
    it.skip('should update a session context with upsert=true', async () => {
      // Create a session context to update

      const tokenManager = container.get<TokenManager>("EmporixTokenManager");
      const { accessToken: _token, sessionId } = await tokenManager.getAnonymousToken(config.tenant, config.clientId);

      const sessionToUpdate = createTestSessionContext(sessionId);
      sessionToUpdate.currency = 'USD';

      await sessionContextApi.updateSessionContext(sessionId, sessionToUpdate, true);

      expect(apiInvoker.authenticatedFetch).toHaveBeenCalledWith(
        `/session-context/${config.tenant}/context/${sessionId}?upsert=true`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sessionToUpdate)
        }
      );

      // Verify the update by fetching the session
      const updatedSession = await sessionContextApi.getSessionContext(testSessionId);
      expect(updatedSession?.currency).toEqual('USD');
    });
  });

  describe('addSessionContextAttribute', () => {
    it.skip('should add an attribute to a session context', async () => {
      const attributeKey = `test-attribute-${Date.now()}`;
      const attributeToAdd = createTestAttribute(attributeKey);

      await sessionContextApi.addSessionContextAttribute(testSessionId, attributeToAdd);

      expect(apiInvoker.authenticatedFetch).toHaveBeenCalledWith(
        `/session-context/showcasetest/context/${testSessionId}/attributes`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(attributeToAdd)
        }
      );

      // Verify the attribute was added by fetching the session
      const updatedSession = await sessionContextApi.getSessionContext(testSessionId);
      expect(updatedSession?.context?.[attributeKey]).toBeDefined();
    });
  });

  describe('removeSessionContextAttribute', () => {
    it.skip('should remove an attribute from a session context', async () => {
      // First add an attribute
      const attributeKey = `test-attribute-to-remove-${Date.now()}`;
      const attributeToAdd = createTestAttribute(attributeKey);

      await sessionContextApi.addSessionContextAttribute(testSessionId, attributeToAdd);

      // Now remove it
      await sessionContextApi.removeSessionContextAttribute(testSessionId, attributeKey);

      expect(apiInvoker.authenticatedFetch).toHaveBeenCalledWith(
        `/session-context/showcasetest/context/${testSessionId}/attributes/${attributeKey}`,
        { method: 'DELETE' }
      );

      // Verify the attribute was removed by fetching the session
      const updatedSession = await sessionContextApi.getSessionContext(testSessionId);
      expect(updatedSession?.context?.[attributeKey]).toBeUndefined();
    });
  });

  describe('getOwnSessionContext', () => {
    it('should fetch the current session context', async () => {
      const result = await sessionContextApi.getOwnSessionContext();
      
      expect(result).toBeDefined();
    });
  });

  describe('updateOwnSessionContext', () => {
    // SKIPPED until DCPS-16490 is resolved
    it.skip('should update the current session context', async () => {
      const partialContext: Partial<EmporixSessionContext> = {
        siteCode: 'test-site',
        currency: 'USD',
        targetLocation: 'US'
      };

      await sessionContextApi.updateOwnSessionContext(partialContext);
      const context = await sessionContextApi.getOwnSessionContext();
      expect(context).toBeDefined();
      expect(context?.siteCode).toEqual(partialContext.siteCode);
      expect(context?.currency).toEqual(partialContext.currency);
      expect(context?.targetLocation).toEqual(partialContext.targetLocation);
     
    });
  });

  const testAttribute = createTestAttribute(`own-context-attribute-${timestamp}`);
  describe('addOwnSessionContextAttribute', () => {
    it('should add an attribute to the current session context', async () => {
        await sessionContextApi.addOwnSessionContextAttribute(testAttribute);

        const response = await sessionContextApi.getOwnSessionContext();
        expect(response).toBeDefined();
        expect(response?.context).toHaveProperty(testAttribute.key, testAttribute.value);
      }
    );

    describe('removeOwnSessionContextAttribute', () => {
      it('should remove an attribute from the current session context', async () => {
        await sessionContextApi.removeOwnSessionContextAttribute(testAttribute.key);

        const response = await sessionContextApi.getOwnSessionContext();
        expect(response).toBeDefined();
        expect(response?.context).not.toBeDefined();

      });
    });
  })
});