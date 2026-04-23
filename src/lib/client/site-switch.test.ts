import { updateSessionContext } from '@/lib/client/session';
import type { LoggerService } from '@/platform/services/logger/LoggerService';
import type { Cart } from '@/platform/services/model/cart/cart';
import type { Session } from '@/platform/services/model/session/session';
import type { SiteSwitchStores } from './site-switch';
import { NAVIGATION_REFRESH_DELAY_MS, performSiteSwitch } from './site-switch';

jest.mock('@/lib/client/session', () => ({
  updateSessionContext: jest.fn(),
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

const mockedUpdateSessionContext = updateSessionContext as jest.Mock;

type SessionStoreState = {
  session: Partial<Session> | null | undefined;
  tryAcquireMutationLock: jest.Mock<boolean, []>;
  releaseMutationLock: jest.Mock<void, []>;
  setSession: jest.Mock<void, [unknown]>;
  setLoading: jest.Mock<void, [boolean]>;
};

type SiteStoreState = {
  resetSite: jest.Mock<void, []>;
  getSite: jest.Mock<{ code: string } | null | undefined, []>;
};

type CartStoreState = {
  beginSettling: jest.Mock<void, [string?]>;
  endSettling: jest.Mock<void, [string?]>;
  clearCart: jest.Mock<void, [unknown?]>;
  fetchCart: jest.Mock<Promise<Cart | null | undefined>, []>;
  syncCurrencyWithSession: jest.Mock<Promise<void>, [string, string]>;
  currentCart?: Cart | null | undefined;
  loading?: boolean;
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
  siteInStore?: { code: string } | null | undefined;
  currentCart?: Cart | null | undefined;
  fetchCartResult?: Cart | null | undefined;
  fetchCartRejectsWith?: Error;
}

function buildStores(options: BuildStoresOptions = {}): {
  stores: SiteSwitchStores;
  sessionState: SessionStoreState;
  siteState: SiteStoreState;
  cartState: CartStoreState;
  cartSetState: jest.Mock;
} {
  const sessionState: SessionStoreState = {
    session: options.session ?? {
      siteCode: 'a',
      currency: 'EUR',
      language: 'en',
      metadata: { version: 3 },
    },
    tryAcquireMutationLock: jest.fn(() => options.lockAvailable !== false),
    releaseMutationLock: jest.fn(),
    setSession: jest.fn(),
    setLoading: jest.fn(),
  };
  const siteState: SiteStoreState = {
    resetSite: jest.fn(),
    getSite: jest.fn(() => options.siteInStore),
  };
  const fetchCartMock: jest.Mock<Promise<Cart | null | undefined>, []> = options.fetchCartRejectsWith
    ? jest.fn(() => Promise.reject(options.fetchCartRejectsWith as Error))
    : jest.fn(() => Promise.resolve(options.fetchCartResult ?? null));
  const cartState: CartStoreState = {
    beginSettling: jest.fn(),
    endSettling: jest.fn(),
    clearCart: jest.fn(),
    fetchCart: fetchCartMock,
    syncCurrencyWithSession: jest.fn<Promise<void>, [string, string]>(() => Promise.resolve()),
    currentCart: options.currentCart,
    loading: false,
  };
  const cartSetState = jest.fn();
  const stores = {
    sessionStore: { getState: () => sessionState },
    siteStore: { getState: () => siteState },
    cartStore: { getState: () => cartState, setState: cartSetState },
  } as unknown as SiteSwitchStores;
  return { stores, sessionState, siteState, cartState, cartSetState };
}

describe('performSiteSwitch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('happy path', () => {
    it('user source: combined PATCH /api/session + GET /api/cart (per-site resolution) + navigate + scheduled refresh', async () => {
      const targetSiteCart = { id: 'cart-b', site: 'b', currency: 'EUR' } as Cart;
      const { stores, sessionState, siteState, cartState, cartSetState } = buildStores({
        session: {
          siteCode: 'a',
          currency: 'EUR',
          language: 'en',
          cartId: 'cart-1',
          metadata: { version: 3 },
        },
        currentCart: { id: 'cart-1', site: 'a', currency: 'EUR' } as Cart,
        fetchCartResult: targetSiteCart,
      });
      mockedUpdateSessionContext.mockResolvedValue({
        siteCode: 'b',
        currency: 'EUR',
        language: 'en',
        cartId: 'cart-1',
        metadata: { version: 4 },
      });

      const navigateTo = jest.fn();
      const getRedirectPath = jest.fn(() => '/b-path');
      const refresh = jest.fn();
      const getSiteByCode = jest.fn(() => Promise.resolve({ languages: ['en'], currencies: ['EUR'] }));
      const logger = createLogger();

      const result = await performSiteSwitch('b', stores, {
        source: 'user',
        locale: 'en',
        navigateTo,
        getRedirectPath,
        getSiteByCode,
        router: { refresh },
        logger,
      });

      expect(result).toEqual(expect.objectContaining({ success: true, upstreamCalls: 2 }));

      expect(sessionState.tryAcquireMutationLock).toHaveBeenCalledTimes(1);
      expect(cartState.beginSettling).toHaveBeenCalledWith('site-switch');
      expect(cartState.endSettling).toHaveBeenCalledWith('site-switch');
      expect(sessionState.releaseMutationLock).toHaveBeenCalledTimes(1);

      expect(mockedUpdateSessionContext).toHaveBeenCalledTimes(1);
      expect(mockedUpdateSessionContext).toHaveBeenCalledWith({ siteCode: 'b' }, 3);
      expect(sessionState.setSession).toHaveBeenCalledWith(
        expect.objectContaining({ siteCode: 'b', metadata: { version: 4 } }),
      );

      // Cart-per-site resolution: drop local cart, snap lastSiteCode, let fetchCart run
      expect(cartSetState).toHaveBeenCalledWith(
        expect.objectContaining({
          currentCart: null,
          lastSiteCode: 'b',
          pendingCurrencySync: null,
        }),
      );
      expect(cartState.fetchCart).toHaveBeenCalledTimes(1);

      expect(siteState.resetSite).toHaveBeenCalledTimes(1);

      expect(navigateTo).toHaveBeenCalledWith('/b-path');
      expect(refresh).not.toHaveBeenCalled();
      jest.advanceTimersByTime(NAVIGATION_REFRESH_DELAY_MS);
      expect(refresh).toHaveBeenCalledTimes(1);

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({ event: 'site_switch', outcome: 'success', upstreamCalls: 2 }),
        expect.any(String),
      );
    });

    it('anonymous (no cart): still issues a single GET /api/cart that resolves to null for new sites', async () => {
      const { stores, cartSetState, cartState } = buildStores({
        session: { siteCode: 'a', currency: 'EUR', language: 'en', metadata: { version: 1 } },
        currentCart: null,
        fetchCartResult: null,
      });
      mockedUpdateSessionContext.mockResolvedValue({
        siteCode: 'b',
        currency: 'EUR',
        language: 'en',
        metadata: { version: 2 },
      });

      const result = await performSiteSwitch('b', stores, {
        source: 'deep-link',
        getSiteByCode: () => Promise.resolve({ languages: ['en'], currencies: ['EUR'] }),
      });

      expect(result).toEqual(expect.objectContaining({ success: true, upstreamCalls: 2 }));
      expect(cartState.fetchCart).toHaveBeenCalledTimes(1);
      expect(cartSetState).toHaveBeenCalledWith(expect.objectContaining({ lastSiteCode: 'b' }));
    });
  });

  describe('guard rails', () => {
    it('same-site target is a no-op (no lock, no upstream calls)', async () => {
      const { stores, sessionState, cartState } = buildStores({
        session: { siteCode: 'a', currency: 'EUR' },
      });
      const logger = createLogger();

      const result = await performSiteSwitch('a', stores, { source: 'user', logger });

      expect(result).toEqual(expect.objectContaining({ success: true, reason: 'same-site', upstreamCalls: 0 }));
      expect(sessionState.tryAcquireMutationLock).not.toHaveBeenCalled();
      expect(cartState.beginSettling).not.toHaveBeenCalled();
      expect(mockedUpdateSessionContext).not.toHaveBeenCalled();
      expect(cartState.fetchCart).not.toHaveBeenCalled();
    });

    it('returns locked when the session mutation lock is held (no PATCH, no settling)', async () => {
      const { stores, sessionState, cartState } = buildStores({
        session: { siteCode: 'a' },
        lockAvailable: false,
      });
      const logger = createLogger();

      const result = await performSiteSwitch('b', stores, { source: 'user', logger });

      expect(result).toEqual(expect.objectContaining({ success: false, reason: 'locked' }));
      expect(sessionState.releaseMutationLock).not.toHaveBeenCalled();
      expect(cartState.beginSettling).not.toHaveBeenCalled();
      expect(mockedUpdateSessionContext).not.toHaveBeenCalled();
    });

    it('returns unknown-site when getSiteByCode returns nothing and releases settling + lock', async () => {
      const { stores, sessionState, cartState } = buildStores();
      const getSiteByCode = jest.fn(() => Promise.resolve(null));
      const logger = createLogger();

      const result = await performSiteSwitch('missing', stores, {
        source: 'user',
        getSiteByCode,
        logger,
      });

      expect(result).toEqual(expect.objectContaining({ success: false, reason: 'unknown-site' }));
      expect(cartState.beginSettling).toHaveBeenCalledTimes(1);
      expect(cartState.endSettling).toHaveBeenCalledTimes(1);
      expect(sessionState.releaseMutationLock).toHaveBeenCalledTimes(1);
      expect(mockedUpdateSessionContext).not.toHaveBeenCalled();
    });

    it('returns error and runs cleanup when the combined PATCH rejects', async () => {
      const { stores, sessionState, cartState } = buildStores();
      mockedUpdateSessionContext.mockRejectedValue(new Error('500'));
      const navigateTo = jest.fn();
      const logger = createLogger();

      const result = await performSiteSwitch('b', stores, {
        source: 'user',
        logger,
        navigateTo,
        getSiteByCode: () => Promise.resolve({ languages: ['en'], currencies: ['EUR'] }),
      });

      expect(result).toEqual(expect.objectContaining({ success: false, reason: 'error' }));
      expect(sessionState.releaseMutationLock).toHaveBeenCalledTimes(1);
      expect(cartState.endSettling).toHaveBeenCalledWith('site-switch');
      expect(cartState.fetchCart).not.toHaveBeenCalled();
      expect(navigateTo).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith(expect.objectContaining({ outcome: 'error' }), expect.any(String));
    });

    it('returns error when updateSessionContext resolves with null', async () => {
      const { stores, sessionState } = buildStores();
      mockedUpdateSessionContext.mockResolvedValue(null);
      const logger = createLogger();

      const result = await performSiteSwitch('b', stores, {
        source: 'deep-link',
        logger,
        getSiteByCode: () => Promise.resolve({ languages: ['en'], currencies: ['EUR'] }),
      });

      expect(result).toEqual(expect.objectContaining({ success: false, reason: 'error' }));
      expect(sessionState.releaseMutationLock).toHaveBeenCalledTimes(1);
    });
  });

  describe('target-site delta computation', () => {
    it('falls back to default currency when current currency is not supported on target site', async () => {
      const { stores } = buildStores({
        session: { siteCode: 'a', currency: 'CHF', language: 'en', metadata: { version: 1 } },
      });
      mockedUpdateSessionContext.mockResolvedValue({
        siteCode: 'b',
        currency: 'USD',
        language: 'en',
        metadata: { version: 2 },
      });

      await performSiteSwitch('b', stores, {
        source: 'deep-link',
        getSiteByCode: () =>
          Promise.resolve({
            languages: ['en'],
            currencies: [{ id: 'USD' }],
            defaultCurrency: { id: 'USD' },
          }),
      });

      expect(mockedUpdateSessionContext).toHaveBeenCalledWith({ siteCode: 'b', currency: 'USD' }, 1);
    });

    it('preserves currency when target site supports it (no currency field in PATCH)', async () => {
      const { stores } = buildStores({
        session: { siteCode: 'a', currency: 'CHF', language: 'en', metadata: { version: 1 } },
      });
      mockedUpdateSessionContext.mockResolvedValue({
        siteCode: 'b',
        currency: 'CHF',
        language: 'en',
        metadata: { version: 2 },
      });

      await performSiteSwitch('b', stores, {
        source: 'deep-link',
        getSiteByCode: () =>
          Promise.resolve({
            languages: ['en'],
            currencies: ['CHF', 'USD'],
            defaultCurrency: 'USD',
          }),
      });

      expect(mockedUpdateSessionContext).toHaveBeenCalledWith({ siteCode: 'b' }, 1);
    });

    it('falls back to default language when current language is not supported on target site', async () => {
      const { stores } = buildStores({
        session: { siteCode: 'fw', currency: 'CHF', language: 'de', metadata: { version: 1 } },
      });
      mockedUpdateSessionContext.mockResolvedValue({
        siteCode: 'us',
        currency: 'CHF',
        language: 'en',
        metadata: { version: 2 },
      });

      await performSiteSwitch('us', stores, {
        source: 'deep-link',
        getSiteByCode: () =>
          Promise.resolve({
            languages: ['en'],
            currencies: ['CHF'],
            defaultLanguage: 'en',
          }),
      });

      expect(mockedUpdateSessionContext).toHaveBeenCalledWith({ siteCode: 'us', language: 'en' }, 1);
    });
  });

  describe('navigation', () => {
    it('deep-link source does not navigate or call router.refresh', async () => {
      const { stores } = buildStores({
        session: { siteCode: 'a', currency: 'EUR', metadata: { version: 1 } },
      });
      mockedUpdateSessionContext.mockResolvedValue({
        siteCode: 'b',
        currency: 'EUR',
        metadata: { version: 2 },
      });

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

    it('skips resetSite when siteStore already holds the target site (SSR-aligned deep-link)', async () => {
      const { stores, siteState } = buildStores({
        session: { siteCode: 'a', currency: 'EUR', language: 'en', metadata: { version: 1 } },
        siteInStore: { code: 'b' },
      });
      mockedUpdateSessionContext.mockResolvedValue({
        siteCode: 'b',
        currency: 'EUR',
        language: 'en',
        metadata: { version: 2 },
      });

      const result = await performSiteSwitch('b', stores, {
        source: 'deep-link',
        getSiteByCode: () => Promise.resolve({ languages: ['en'], currencies: ['EUR'] }),
      });

      expect(result.success).toBe(true);
      expect(siteState.resetSite).not.toHaveBeenCalled();
    });

    it('picks a target-site-compatible redirect locale when current UI locale is unsupported', async () => {
      const { stores } = buildStores({
        session: { siteCode: 'fw', currency: 'CHF', language: 'de', metadata: { version: 1 } },
      });
      mockedUpdateSessionContext.mockResolvedValue({
        siteCode: 'us',
        currency: 'USD',
        language: 'en',
        metadata: { version: 2 },
      });

      const navigateTo = jest.fn();
      const getRedirectPath = jest.fn(() => '/us');
      const refresh = jest.fn();

      const result = await performSiteSwitch('us', stores, {
        source: 'user',
        locale: 'de',
        navigateTo,
        getRedirectPath,
        getSiteByCode: () => Promise.resolve({ languages: ['en'], currencies: ['USD'] }),
        router: { refresh },
      });

      expect(result.success).toBe(true);
      expect(getRedirectPath).toHaveBeenCalledWith(
        expect.objectContaining({ locale: 'en', site: 'us', forcePrefix: true }),
      );
      expect(navigateTo).toHaveBeenCalledWith('/us');
    });
  });

  describe('cart-per-site resolution', () => {
    it('completes successfully and logs error when fetchCart rejects (leaves cart unresolved)', async () => {
      const { stores, cartState } = buildStores({
        session: {
          siteCode: 'a',
          currency: 'EUR',
          language: 'en',
          cartId: 'cart-1',
          metadata: { version: 1 },
        },
        currentCart: { id: 'cart-1', site: 'a', currency: 'EUR' } as Cart,
        fetchCartRejectsWith: new Error('upstream 500'),
      });
      mockedUpdateSessionContext.mockResolvedValue({
        siteCode: 'b',
        currency: 'EUR',
        language: 'en',
        cartId: 'cart-1',
        metadata: { version: 2 },
      });

      const logger = createLogger();
      const result = await performSiteSwitch('b', stores, {
        source: 'deep-link',
        getSiteByCode: () => Promise.resolve({ languages: ['en'], currencies: ['EUR'] }),
        logger,
      });

      expect(result.success).toBe(true);
      expect(cartState.fetchCart).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({ siteCode: 'b' }),
        expect.stringContaining('fetchCart failed'),
      );
    });

    it('resolves per-site cart via fetchCart even when previous site had a cart (cart-per-site, not carried)', async () => {
      const previousCart = { id: 'cart-a', site: 'a', currency: 'EUR' } as Cart;
      const perSiteCart = { id: 'cart-b', site: 'b', currency: 'EUR' } as Cart;
      const { stores, cartState, cartSetState } = buildStores({
        session: {
          siteCode: 'a',
          currency: 'EUR',
          language: 'en',
          cartId: 'cart-a',
          metadata: { version: 1 },
        },
        currentCart: previousCart,
        fetchCartResult: perSiteCart,
      });
      mockedUpdateSessionContext.mockResolvedValue({
        siteCode: 'b',
        currency: 'EUR',
        language: 'en',
        cartId: 'cart-a',
        metadata: { version: 2 },
      });

      await performSiteSwitch('b', stores, {
        source: 'deep-link',
        getSiteByCode: () => Promise.resolve({ languages: ['en'], currencies: ['EUR'] }),
      });

      // Previous cart was cleared from local state before fetchCart
      expect(cartSetState).toHaveBeenCalledWith(expect.objectContaining({ currentCart: null, lastSiteCode: 'b' }));
      expect(cartState.fetchCart).toHaveBeenCalledTimes(1);
    });

    it('reconciles cart currency to session currency when the resolved per-site cart is stale (e.g. us-branch cached USD cart, session CHF)', async () => {
      // Post-switch the test helper's cartSetState does not actually mutate cartState.currentCart,
      // so we seed the "resolved" per-site cart via options.currentCart. This simulates the
      // state after fetchCart has installed a us-branch/USD cart while the session moved to
      // us-branch/CHF (two sites sharing CHF — orchestrator preserved the prior currency).
      const staleUsBranchCart = { id: 'us-cart', site: 'us-branch', currency: 'USD' } as Cart;
      const { stores, cartState } = buildStores({
        session: {
          siteCode: 'fw-site',
          currency: 'CHF',
          language: 'de',
          cartId: 'fw-cart',
          metadata: { version: 20 },
        },
        currentCart: staleUsBranchCart,
      });
      mockedUpdateSessionContext.mockResolvedValue({
        siteCode: 'us-branch',
        currency: 'CHF',
        language: 'en',
        cartId: 'us-cart',
        metadata: { version: 21 },
      });

      await performSiteSwitch('us-branch', stores, {
        source: 'deep-link',
        getSiteByCode: () => Promise.resolve({ languages: ['en'], currencies: ['USD', 'CHF'], defaultCurrency: 'USD' }),
      });

      expect(cartState.syncCurrencyWithSession).toHaveBeenCalledTimes(1);
      expect(cartState.syncCurrencyWithSession).toHaveBeenCalledWith('CHF', 'us-branch');
    });

    it('does not reconcile cart currency when the resolved per-site cart already agrees with session currency', async () => {
      const alignedCart = { id: 'us-cart', site: 'us-branch', currency: 'CHF' } as Cart;
      const { stores, cartState } = buildStores({
        session: {
          siteCode: 'fw-site',
          currency: 'CHF',
          language: 'de',
          cartId: 'fw-cart',
          metadata: { version: 20 },
        },
        currentCart: alignedCart,
      });
      mockedUpdateSessionContext.mockResolvedValue({
        siteCode: 'us-branch',
        currency: 'CHF',
        language: 'en',
        cartId: 'us-cart',
        metadata: { version: 21 },
      });

      await performSiteSwitch('us-branch', stores, {
        source: 'deep-link',
        getSiteByCode: () => Promise.resolve({ languages: ['en'], currencies: ['USD', 'CHF'], defaultCurrency: 'USD' }),
      });

      expect(cartState.syncCurrencyWithSession).not.toHaveBeenCalled();
    });

    it('does not reconcile cart currency when the resolved cart belongs to a different site (guard against cross-site mutation)', async () => {
      // If somehow the fetchCart result still points at the previous site's cart (race or
      // upstream edge case), the reconcile must NOT fire — otherwise we would `PATCH /changeCurrency`
      // on a cart tagged to the wrong site. The site-guard inside syncCurrencyWithSession already
      // enforces this, but the orchestrator should short-circuit before even calling it.
      const wrongSiteCart = { id: 'fw-cart', site: 'fw-site', currency: 'CHF' } as Cart;
      const { stores, cartState } = buildStores({
        session: {
          siteCode: 'fw-site',
          currency: 'CHF',
          language: 'de',
          cartId: 'fw-cart',
          metadata: { version: 20 },
        },
        currentCart: wrongSiteCart,
      });
      mockedUpdateSessionContext.mockResolvedValue({
        siteCode: 'us-branch',
        currency: 'USD',
        language: 'en',
        cartId: 'fw-cart',
        metadata: { version: 21 },
      });

      await performSiteSwitch('us-branch', stores, {
        source: 'deep-link',
        getSiteByCode: () => Promise.resolve({ languages: ['en'], currencies: ['USD'], defaultCurrency: 'USD' }),
      });

      expect(cartState.syncCurrencyWithSession).not.toHaveBeenCalled();
    });
  });
});
