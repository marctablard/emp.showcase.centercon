// src/stores/sync/store-synchronizer.ts
import { shallow } from 'zustand/shallow';
import { updateSessionSite } from '@/lib/client/session';
import { invalidateShippingMethodsResponseCache } from '@/lib/client/shipping-methods-response-cache';
import { getLogger } from '@/lib/logger/use-logger-client';
import type { CartStoreApi, CustomerStoreApi, SessionStoreApi, SiteStoreApi } from '@/providers/StoreProvider';

type UnsubscribeFn = () => void;

interface StoreSynchronizerParams {
  sessionStore: SessionStoreApi;
  cartStore: CartStoreApi;
  siteStore: SiteStoreApi;
  customerStore: CustomerStoreApi;
}

const CURRENCY_SYNC_RETRY_DELAYS_MS = [0, 250, 750];

/**
 * Sets up cross-store subscriptions for state synchronization.
 * Returns an array of unsubscribe functions that should be called on cleanup.
 *
 * This module centralizes cross-store side effects that were previously scattered
 * across individual hooks (like useCart). By using Zustand's subscribeWithSelector,
 * we can:
 * - Run effects only once instead of in every component that uses the hook
 * - Ensure proper cleanup on unmount
 * - Reduce duplicate API calls significantly
 *
 * Subscriptions:
 * 1. Session currency changes → Cart currency update
 * 2. Session site changes → Cart site validation
 * 3. Session site changes → Site store reset (triggers re-fetch of site config, currencies, etc.)
 * 4. Session legalEntityId changes (B2B company switcher) → Cart re-fetch for current company
 * 5. Session site / legal entity changes → Invalidate cached legal-entity checkout addresses (single refetch per new key)
 * 6. Session site / currency / legal entity changes → Invalidate client shipping-methods response cache (GET /api/shipping)
 * 7. Cart loaded with stale currency → trigger currency sync (handles page refresh with mismatched cart)
 */
export function setupStoreSynchronization({
  sessionStore,
  cartStore,
  siteStore,
  customerStore,
}: StoreSynchronizerParams): UnsubscribeFn[] {
  const unsubscribers: UnsubscribeFn[] = [];
  let activeCurrencySyncToken = 0;

  const unsubShippingMethodsCache = sessionStore.subscribe(
    (state) => ({
      currency: state.session?.currency,
      siteCode: state.session?.siteCode,
      legalEntityId: typeof state.session?.legalEntityId === 'string' ? state.session.legalEntityId.trim() : '',
    }),
    () => {
      invalidateShippingMethodsResponseCache();
    },
    { equalityFn: shallow },
  );
  unsubscribers.push(unsubShippingMethodsCache);

  const runCurrencySync = async (currency: string, siteCode: string) => {
    const syncToken = ++activeCurrencySyncToken;
    for (let i = 0; i < CURRENCY_SYNC_RETRY_DELAYS_MS.length; i++) {
      const delay = CURRENCY_SYNC_RETRY_DELAYS_MS[i];
      if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      // Cancel stale scheduled attempts if newer currency/site changes arrived.
      if (syncToken !== activeCurrencySyncToken) {
        return;
      }

      const latestSession = sessionStore.getState().session;
      if (!latestSession || latestSession.currency !== currency || latestSession.siteCode !== siteCode) {
        return;
      }

      try {
        await cartStore.getState().syncCurrencyWithSession(currency, siteCode);
      } catch (error) {
        getLogger().error({ error, currency, siteCode, attempt: i + 1 }, 'Failed to sync cart currency with session');
      }
    }

    try {
      await cartStore.getState().flushPendingCurrencySync();
    } catch (error) {
      getLogger().error({ error, currency, siteCode }, 'Failed to flush pending currency sync intent');
    }
  };

  // Subscription 1: Currency synchronization
  // When session currency changes, update cart currency to match
  const unsubCurrency = sessionStore.subscribe(
    (state) => ({
      currency: state.session?.currency,
      siteCode: state.session?.siteCode,
    }),
    async ({ currency, siteCode }) => {
      if (!currency || !siteCode) return;
      await runCurrencySync(currency, siteCode);
    },
    { equalityFn: shallow },
  );
  unsubscribers.push(unsubCurrency);

  // Subscription 2: Site validation
  // When session site changes, validate that cart belongs to the current site
  const unsubSite = sessionStore.subscribe(
    (state) => state.session?.siteCode,
    async (siteCode, prevSiteCode) => {
      if (!siteCode || siteCode === prevSiteCode) return;

      try {
        await cartStore.getState().validateSite(siteCode);
      } catch (error) {
        getLogger().error({ error }, 'Failed to validate cart site');
      }
    },
  );
  unsubscribers.push(unsubSite);

  // Subscription 3: Site store reset
  // When session site changes, reset the site store so useSite() re-fetches
  // the correct site config (currencies, countries, regions, payment modes).
  // Without this, a soft client-side navigation after site switch keeps stale
  // site data in the store — e.g., currency switcher shows USD on main site.
  const unsubSiteStore = sessionStore.subscribe(
    (state) => state.session?.siteCode,
    (siteCode, prevSiteCode) => {
      if (!siteCode || siteCode === prevSiteCode) return;

      const currentSite = siteStore.getState().getSite();
      if (currentSite && currentSite.code !== siteCode) {
        customerStore.getState().invalidateLegalEntityCheckoutAddresses();
        siteStore.getState().reset();
      }
    },
  );
  unsubscribers.push(unsubSiteStore);

  const unsubLegalEntity = sessionStore.subscribe(
    (state) => {
      const le = state.session?.legalEntityId;
      return typeof le === 'string' ? le.trim() : '';
    },
    async (legalEntityId, previousLegalEntityId) => {
      if (legalEntityId === previousLegalEntityId) {
        return;
      }
      customerStore.getState().invalidateLegalEntityCheckoutAddresses();
      try {
        await cartStore.getState().validateLegalEntity(legalEntityId === '' ? undefined : legalEntityId);
      } catch (error) {
        getLogger().error({ error }, 'Failed to validate cart legal entity');
      }
    },
  );
  unsubscribers.push(unsubLegalEntity);

  // Subscription 5: Site store → session reconciliation
  // When the URL-derived site (site store) changes and differs from the session site,
  // update the session to match. This handles direct URL navigation between sites
  // (browser back/forward, bookmarks) where the site switcher flow is bypassed.
  let reconciliationInFlight = false;

  // Track when the session's siteCode was last mutated. During a normal site switch
  // the user updates the session first (via setSite / PUT /api/session/site), then
  // the navigation redirects to the new URL. In between, the site store briefly
  // reverts to the OLD code (reset → useSite re-fetches from the not-yet-updated
  // URL). If the debounced reconciliation fires during this window, it would
  // REVERT the session. We use this timestamp to skip reconciliation when the
  // session was recently changed by the user (the session is the source of truth).
  let lastSessionSiteChangeAt = 0;

  const unsubTrackSessionSiteChange = sessionStore.subscribe(
    (state) => state.session?.siteCode,
    () => {
      lastSessionSiteChangeAt = Date.now();
    },
  );
  unsubscribers.push(unsubTrackSessionSiteChange);

  const RECONCILIATION_GRACE_PERIOD_MS = 5000;

  const reconcileSiteWithSession = async (siteCode: string) => {
    const sessionState = sessionStore.getState();
    const sessionSiteCode = sessionState.session?.siteCode;
    if (!sessionSiteCode || sessionSiteCode === siteCode || reconciliationInFlight) {
      return;
    }

    // If a session mutation is in progress (e.g. site switcher calling setSite),
    // the session store hasn't been updated yet but a PUT is already in flight.
    // Reconciling now would revert the change.
    if (sessionState.loading || sessionState.isMutationInFlight()) {
      getLogger().info(
        { urlSite: siteCode, sessionSite: sessionSiteCode },
        'Skipping site/session reconciliation — session mutation in progress',
      );
      return;
    }

    // If the session site was recently mutated (by site switcher, etc.), the session
    // is the source of truth and the URL will catch up after navigation completes.
    if (lastSessionSiteChangeAt > 0 && Date.now() - lastSessionSiteChangeAt < RECONCILIATION_GRACE_PERIOD_MS) {
      getLogger().info(
        {
          urlSite: siteCode,
          sessionSite: sessionSiteCode,
          msSinceMutation: Date.now() - lastSessionSiteChangeAt,
        },
        'Skipping site/session reconciliation — session was recently mutated',
      );
      return;
    }

    // Acquire the mutation lock to prevent concurrent session mutations.
    // If another mutation just started (e.g. site switcher), bail out.
    if (!sessionStore.getState().tryAcquireMutationLock()) {
      getLogger().info(
        { urlSite: siteCode, sessionSite: sessionSiteCode },
        'Skipping site/session reconciliation — could not acquire mutation lock',
      );
      return;
    }

    reconciliationInFlight = true;
    try {
      getLogger().info(
        { urlSite: siteCode, sessionSite: sessionSiteCode },
        'Site/session mismatch — reconciling session to URL site',
      );
      sessionStore.getState().setLoading(true);
      const success = await updateSessionSite(siteCode);
      if (success) {
        await sessionStore.getState().fetchSession();
      }
    } catch (error) {
      getLogger().error({ error, siteCode }, 'Failed to reconcile site/session');
    } finally {
      sessionStore.getState().setLoading(false);
      sessionStore.getState().releaseMutationLock();
      reconciliationInFlight = false;
    }
  };

  // Debounce reconciliation: during a normal site switch the site store
  // briefly reverts to the old site code (reset → re-fetch from stale URL)
  // before settling on the new code once the page navigates. Without the
  // debounce, the transient old code triggers reconcileSiteWithSession
  // which REVERTS the session back to the previous site.
  let reconciliationTimer: ReturnType<typeof setTimeout> | null = null;
  const RECONCILIATION_DEBOUNCE_MS = 2000;

  const unsubSiteReconcile = siteStore.subscribe(
    (state) => state.site?.code,
    (siteCode) => {
      if (reconciliationTimer) {
        clearTimeout(reconciliationTimer);
        reconciliationTimer = null;
      }
      if (siteCode) {
        reconciliationTimer = setTimeout(() => {
          const currentSiteCode = siteStore.getState().site?.code;
          if (currentSiteCode !== siteCode) {
            return;
          }
          const state = sessionStore.getState();
          if (state.loading || state.isMutationInFlight()) {
            return;
          }
          void reconcileSiteWithSession(siteCode);
        }, RECONCILIATION_DEBOUNCE_MS);
      }
    },
  );

  const cleanupReconcileTimer = () => {
    if (reconciliationTimer) {
      clearTimeout(reconciliationTimer);
      reconciliationTimer = null;
    }
  };
  unsubscribers.push(() => {
    cleanupReconcileTimer();
    unsubSiteReconcile();
  });

  // Debounced initial mismatch check (stores may already be initialized with mismatched values)
  const initialSiteCode = siteStore.getState().site?.code;
  if (initialSiteCode) {
    reconciliationTimer = setTimeout(() => {
      const currentSiteCode = siteStore.getState().site?.code;
      if (currentSiteCode !== initialSiteCode) {
        return;
      }
      const state = sessionStore.getState();
      if (state.loading || state.isMutationInFlight()) {
        return;
      }
      void reconcileSiteWithSession(initialSiteCode);
    }, RECONCILIATION_DEBOUNCE_MS);
  }

  // Subscription 7: Cart site & currency validation on load
  // When a cart is loaded/fetched with a site or currency that doesn't match the
  // session, trigger validation. Handles page refreshes where the session already has
  // the correct values but the cart was persisted from a previous site/currency.
  // Subscription 1 (session changes) and Subscription 2 (session site changes) only
  // fire on CHANGES, so they miss the initial-load case.
  const unsubCartCheck = cartStore.subscribe(
    (state) => ({
      cartCurrency: state.currentCart?.currency,
      cartSite: state.currentCart?.site,
    }),
    async ({ cartCurrency, cartSite }) => {
      if (!cartSite) return;

      const session = sessionStore.getState().session;
      if (!session?.currency || !session?.siteCode) return;

      if (cartSite !== session.siteCode) {
        getLogger().info(
          { cartSite, sessionSite: session.siteCode },
          'Cart belongs to different site — clearing and refetching',
        );
        try {
          // validateSite is a no-op when lastSiteCode already matches the new site
          // (which happens after reconciliation). Directly clear the stale cart and refetch.
          const state = cartStore.getState();
          state.setCurrentCart(null);
          await state.fetchCart(false);
        } catch (error) {
          getLogger().error({ error }, 'Failed to clear wrong-site cart');
        }
        return;
      }

      if (cartCurrency && cartCurrency !== session.currency) {
        await runCurrencySync(session.currency, session.siteCode);
      }
    },
    { equalityFn: shallow },
  );
  unsubscribers.push(unsubCartCheck);

  return unsubscribers;
}
