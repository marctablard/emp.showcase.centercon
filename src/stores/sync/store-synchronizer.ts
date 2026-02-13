// src/stores/sync/store-synchronizer.ts
import { shallow } from 'zustand/shallow';
import { getLogger } from '@/lib/logger/use-logger-client';
import type { CartStoreApi, SessionStoreApi, SiteStoreApi } from '@/providers/StoreProvider';

type UnsubscribeFn = () => void;

interface StoreSynchronizerParams {
  sessionStore: SessionStoreApi;
  cartStore: CartStoreApi;
  /** Reserved for future site-related subscriptions (e.g., site config changes triggering cart updates) */
  siteStore: SiteStoreApi;
}

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
 */
export function setupStoreSynchronization({ sessionStore, cartStore }: StoreSynchronizerParams): UnsubscribeFn[] {
  const unsubscribers: UnsubscribeFn[] = [];

  // Subscription 1: Currency synchronization
  // When session currency changes, update cart currency to match
  const unsubCurrency = sessionStore.subscribe(
    (state) => ({
      currency: state.session?.currency,
      siteCode: state.session?.siteCode,
    }),
    async ({ currency, siteCode }) => {
      if (!currency || !siteCode) return;

      try {
        await cartStore.getState().syncCurrencyWithSession(currency, siteCode);
      } catch (error) {
        getLogger().error({ error }, 'Failed to sync cart currency with session');
      }
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

  return unsubscribers;
}
