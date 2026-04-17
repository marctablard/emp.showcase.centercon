import { fetchCurrentSession, updateSessionSite } from '@/lib/client/session';
import type { LoggerService } from '@/platform/services/logger/LoggerService';
import type { Session } from '@/platform/services/model/session/session';
import type { SiteSwitchStores } from './site-switch';
import { NAVIGATION_REFRESH_DELAY_MS, performSiteSwitch } from './site-switch';

jest.mock('@/lib/client/session', () => ({
  updateSessionSite: jest.fn(),
  fetchCurrentSession: jest.fn(),
}));

jest.mock('@/lib/logger/use-logger-client', () => ({
  getLogger: () => ({
    trace: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
  }),
}));

const mockedUpdateSessionSite = updateSessionSite as jest.Mock;
const mockedFetchCurrentSession = fetchCurrentSession as jest.Mock;

type SessionStoreState = {
  session: Partial<Session> | null | undefined;
  tryAcquireMutationLock: jest.Mock<boolean, []>;
  releaseMutationLock: jest.Mock<void, []>;
  setSession: jest.Mock<void, [unknown]>;
  setLoading: jest.Mock<void, [boolean]>;
};

type SiteStoreState = {
  resetSite: jest.Mock<void, []>;
};

type CartStoreState = {
  validateSite: jest.Mock<Promise<void>, [string]>;
  syncCurrencyWithSession: jest.Mock<Promise<void>, [string, string]>;
};

function createLogger(): jest.Mocked<LoggerService> {
  return {
    trace: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
  } as unknown as jest.Mocked<LoggerService>;
}

interface BuildStoresOptions {
  session?: Partial<Session> | null | undefined;
  lockAvailable?: boolean;
  cartValidateSiteImpl?: () => Promise<void>;
}

function buildStores(options: BuildStoresOptions = {}): {
  stores: SiteSwitchStores;
  sessionState: SessionStoreState;
  siteState: SiteStoreState;
  cartState: CartStoreState;
} {
  const sessionState: SessionStoreState = {
    session: options.session ?? { siteCode: 'a', currency: 'EUR', language: 'en' },
    tryAcquireMutationLock: jest.fn(() => options.lockAvailable !== false),
    releaseMutationLock: jest.fn(),
    setSession: jest.fn(),
    setLoading: jest.fn(),
  };
  const siteState: SiteStoreState = {
    resetSite: jest.fn(),
  };
  const cartState: CartStoreState = {
    validateSite: jest.fn<Promise<void>, [string]>(options.cartValidateSiteImpl ?? (() => Promise.resolve())),
    syncCurrencyWithSession: jest.fn<Promise<void>, [string, string]>(() => Promise.resolve()),
  };
  const stores = {
    sessionStore: { getState: () => sessionState },
    siteStore: { getState: () => siteState },
    cartStore: { getState: () => cartState },
  } as unknown as SiteSwitchStores;
  return { stores, sessionState, siteState, cartState };
}

describe('performSiteSwitch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('happy path (user source): awaits session update, refetch, site reset + cart validation in parallel, and schedules router.refresh after navigate', async () => {
    const { stores, sessionState, siteState, cartState } = buildStores({
      session: { siteCode: 'a', currency: 'EUR', language: 'en' },
    });
    mockedUpdateSessionSite.mockResolvedValue(true);
    mockedFetchCurrentSession.mockResolvedValue({ siteCode: 'b', currency: 'EUR', language: 'en' });

    let cartValidateResolved = false;
    cartState.validateSite.mockImplementation(async () => {
      await Promise.resolve();
      cartValidateResolved = true;
    });

    const navigateTo = jest.fn();
    const getRedirectPath = jest.fn(() => '/b-path');
    const refresh = jest.fn();
    const getSiteByCode = jest.fn(() => Promise.resolve({ languages: ['en'] }));
    const logger = createLogger();

    const resultPromise = performSiteSwitch('b', stores, {
      source: 'user',
      locale: 'en',
      navigateTo,
      getRedirectPath,
      getSiteByCode,
      router: { refresh },
      logger,
    });
    const result = await resultPromise;

    expect(result).toEqual(expect.objectContaining({ success: true }));
    expect(sessionState.tryAcquireMutationLock).toHaveBeenCalledTimes(1);
    expect(mockedUpdateSessionSite).toHaveBeenCalledWith('b');
    expect(mockedFetchCurrentSession).toHaveBeenCalledWith(true);
    expect(sessionState.setSession).toHaveBeenCalledWith({ siteCode: 'b', currency: 'EUR', language: 'en' });
    expect(siteState.resetSite).toHaveBeenCalledTimes(1);
    expect(cartState.validateSite).toHaveBeenCalledWith('b');
    expect(cartValidateResolved).toBe(true);
    expect(navigateTo).toHaveBeenCalledWith('/b-path');
    expect(getRedirectPath).toHaveBeenCalledWith({
      href: '/',
      locale: 'en',
      site: 'b',
      forcePrefix: true,
    });
    expect(refresh).not.toHaveBeenCalled();

    jest.advanceTimersByTime(NAVIGATION_REFRESH_DELAY_MS);
    expect(refresh).toHaveBeenCalledTimes(1);

    expect(sessionState.releaseMutationLock).toHaveBeenCalledTimes(1);
    expect(sessionState.setLoading).toHaveBeenNthCalledWith(1, true);
    expect(sessionState.setLoading).toHaveBeenLastCalledWith(false);
    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'site_switch', outcome: 'success', from: 'a', to: 'b' }),
      expect.any(String),
    );
  });

  it('same-site target is a no-op and releases nothing (never acquires lock)', async () => {
    const { stores, sessionState, siteState, cartState } = buildStores({
      session: { siteCode: 'a', currency: 'EUR' },
    });
    const logger = createLogger();

    const result = await performSiteSwitch('a', stores, { source: 'user', logger });

    expect(result).toEqual(expect.objectContaining({ success: true, reason: 'same-site' }));
    expect(sessionState.tryAcquireMutationLock).not.toHaveBeenCalled();
    expect(mockedUpdateSessionSite).not.toHaveBeenCalled();
    expect(siteState.resetSite).not.toHaveBeenCalled();
    expect(cartState.validateSite).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(expect.objectContaining({ outcome: 'same-site' }), expect.any(String));
  });

  it('returns locked and does not mutate when the session mutation lock is held', async () => {
    const { stores, sessionState } = buildStores({
      session: { siteCode: 'a' },
      lockAvailable: false,
    });
    const logger = createLogger();

    const result = await performSiteSwitch('b', stores, { source: 'user', logger });

    expect(result).toEqual(expect.objectContaining({ success: false, reason: 'locked' }));
    expect(sessionState.tryAcquireMutationLock).toHaveBeenCalledTimes(1);
    expect(sessionState.releaseMutationLock).not.toHaveBeenCalled();
    expect(mockedUpdateSessionSite).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(expect.objectContaining({ outcome: 'locked' }), expect.any(String));
  });

  it('returns error and releases the lock when updateSessionSite rejects', async () => {
    const { stores, sessionState, siteState, cartState } = buildStores();
    mockedUpdateSessionSite.mockRejectedValue(new Error('500'));
    const navigateTo = jest.fn();
    const logger = createLogger();

    const result = await performSiteSwitch('b', stores, { source: 'user', logger, navigateTo });

    expect(result).toEqual(expect.objectContaining({ success: false, reason: 'error' }));
    expect(sessionState.releaseMutationLock).toHaveBeenCalledTimes(1);
    expect(siteState.resetSite).not.toHaveBeenCalled();
    expect(cartState.validateSite).not.toHaveBeenCalled();
    expect(navigateTo).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith(expect.objectContaining({ outcome: 'error' }), expect.any(String));
  });

  it('invokes syncCurrencyWithSession when the new session currency differs from the previous', async () => {
    const { stores, cartState } = buildStores({
      session: { siteCode: 'a', currency: 'EUR', language: 'en' },
    });
    mockedUpdateSessionSite.mockResolvedValue(true);
    mockedFetchCurrentSession.mockResolvedValue({ siteCode: 'b', currency: 'USD', language: 'en' });

    const result = await performSiteSwitch('b', stores, { source: 'deep-link' });

    expect(result.success).toBe(true);
    expect(cartState.syncCurrencyWithSession).toHaveBeenCalledWith('USD', 'b');
  });

  it('does not invoke syncCurrencyWithSession when the currency is unchanged', async () => {
    const { stores, cartState } = buildStores({
      session: { siteCode: 'a', currency: 'EUR', language: 'en' },
    });
    mockedUpdateSessionSite.mockResolvedValue(true);
    mockedFetchCurrentSession.mockResolvedValue({ siteCode: 'b', currency: 'EUR', language: 'en' });

    await performSiteSwitch('b', stores, { source: 'deep-link' });

    expect(cartState.syncCurrencyWithSession).not.toHaveBeenCalled();
  });

  it('deep-link source does not navigate or call router.refresh', async () => {
    const { stores } = buildStores({
      session: { siteCode: 'a', currency: 'EUR' },
    });
    mockedUpdateSessionSite.mockResolvedValue(true);
    mockedFetchCurrentSession.mockResolvedValue({ siteCode: 'b', currency: 'EUR' });

    const navigateTo = jest.fn();
    const getRedirectPath = jest.fn();
    const refresh = jest.fn();

    await performSiteSwitch('b', stores, {
      source: 'deep-link',
      navigateTo,
      getRedirectPath,
      router: { refresh },
    });

    jest.advanceTimersByTime(NAVIGATION_REFRESH_DELAY_MS * 5);
    expect(navigateTo).not.toHaveBeenCalled();
    expect(getRedirectPath).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
  });

  it('returns unknown-site and releases the lock when getSiteByCode returns nothing', async () => {
    const { stores, sessionState, siteState } = buildStores();
    const getSiteByCode = jest.fn(() => Promise.resolve(null));
    const logger = createLogger();

    const result = await performSiteSwitch('missing', stores, {
      source: 'user',
      getSiteByCode,
      logger,
    });

    expect(result).toEqual(expect.objectContaining({ success: false, reason: 'unknown-site' }));
    expect(sessionState.releaseMutationLock).toHaveBeenCalledTimes(1);
    expect(mockedUpdateSessionSite).not.toHaveBeenCalled();
    expect(siteState.resetSite).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(expect.objectContaining({ outcome: 'unknown-site' }), expect.any(String));
  });

  it('resetSite and validateSite are awaited in parallel (not sequential)', async () => {
    const { stores, siteState, cartState } = buildStores();
    mockedUpdateSessionSite.mockResolvedValue(true);
    mockedFetchCurrentSession.mockResolvedValue({ siteCode: 'b', currency: 'EUR' });

    const order: string[] = [];
    siteState.resetSite.mockImplementation(() => {
      order.push('resetSite');
    });
    cartState.validateSite.mockImplementation(async () => {
      order.push('validateSite:start');
      await Promise.resolve();
      order.push('validateSite:end');
    });

    await performSiteSwitch('b', stores, { source: 'deep-link' });

    // resetSite is sync and fires before validateSite's promise resolves, but both are part of
    // the same Promise.all, so validateSite must have started before the await completed.
    expect(order).toContain('resetSite');
    expect(order).toContain('validateSite:start');
    expect(order.indexOf('validateSite:start')).toBeLessThan(order.indexOf('validateSite:end'));
  });
});
