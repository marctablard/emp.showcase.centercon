'use client';

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  addItemToCart as apiAddItemToCart,
  fetchCurrentCart as apiFetchCurrentCart,
  removeCartItem as apiRemoveCartItem,
  updateCartCurrency as apiUpdateCartCurrency,
  updateCartItemQuantity as apiUpdateCartItemQuantity,
  updateShippingInfo as apiUpdateShippingInfo,
  clearCartSession,
  loadSavedCart,
} from '@/lib/client/carts';
import { devSyncLog } from '@/lib/client/dev-sync-log';
import { getLogger } from '@/lib/logger/use-logger-client';
import type { CartShippingAddress, ModifyCartItemResult } from '@/platform/services/cart/CartService';
import type { Cart } from '@/platform/services/model/cart/cart';

export interface CartState {
  // Cart data, null means no cart, undefined means unknown state
  currentCart: Cart | null | undefined;
  loading: boolean;
  error: Error | null;
  lastShippingUpdate: {
    country?: string;
    zipCode?: string;
    timestamp: number;
  } | null;
  sessionStatus: string | null;
  // Track last site code to detect site changes
  lastSiteCode: string | null;
  /** Normalized session legal entity; null = not initialized yet (mirrors lastSiteCode). */
  lastLegalEntityId: string | null;
  pendingCurrencySync: {
    currency: string;
    siteCode: string;
    attempts: number;
  } | null;
}

interface CartActions {
  // Cart state operations
  setCurrentCart: (cart: Cart | null | undefined) => void;
  getCurrentCart: () => Cart | null | undefined;
  setLoading: (loading: boolean) => void;
  getLoading: () => boolean;
  setError: (error: Error | null) => void;
  loadCart: (cartId: string, type?: string) => Promise<Cart | null | undefined>;

  validateCart: (sessionStatus: string) => Promise<void>;
  validateSite: (siteCode: string) => Promise<void>;
  validateLegalEntity: (legalEntityId: string | undefined) => Promise<void>;

  // Cart API operations
  fetchCart: (createCurrent?: boolean) => Promise<Cart | null | undefined>;
  addToCart: (productId: string, quantity: number, _retryCount?: number) => Promise<ModifyCartItemResult>;
  updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateShippingInfo: (shippingAddress: CartShippingAddress, billingAddress?: CartShippingAddress) => Promise<void>;
  updateCurrency: (currency: string) => Promise<void>;
  clearCart: (options?: { deleteCart?: boolean; clearSession?: boolean }) => void;

  // Cross-store synchronization
  syncCurrencyWithSession: (currency: string, siteCode: string) => Promise<void>;
  flushPendingCurrencySync: () => Promise<void>;
  /** Drop in-flight fetchCart dedup so the next fetch cannot resolve a stale site transition. */
  invalidateInFlightCartFetch: () => void;
}
export type CartStore = CartState & CartActions;

const MAX_PENDING_CURRENCY_SYNC_RETRIES = 3;

// default state explicitly 'undefined' since it means, we don't know the cart's state
const defaultState: CartState = {
  currentCart: undefined,
  loading: false,
  error: null,
  lastShippingUpdate: null,
  sessionStatus: null,
  lastSiteCode: null,
  lastLegalEntityId: null,
  pendingCurrencySync: null,
};

export const createCartStore = (initState: CartState = defaultState) => {
  // In-flight promise deduplication for fetchCart
  // Stored outside Zustand state to avoid triggering re-renders
  let _fetchPromise: Promise<Cart | null | undefined> | null = null;
  let _fetchPromiseCreate: boolean = false;
  /**
   * Bumped by {@link invalidateInFlightCartFetch}. In-flight fetchCart work must not call `set`
   * after await if a newer generation superseded it — otherwise a stale GET /api/cart response
   * reapplies the previous site's cart and store-sync re-enters validateSite in a tight loop.
   */
  let _cartFetchEpoch = 0;
  /** Serializes PATCH /shipping so parallel callers cannot race Emporix optimistic locking. */
  let _shippingUpdateGate: Promise<void> = Promise.resolve();
  /** Serializes validateSite so session-driven and cart-driven site recovery never overlap fetchCart. */
  let _validateSiteChain: Promise<void> = Promise.resolve();

  return create<CartStore>()(
    subscribeWithSelector((set, get) => ({
      ...initState,
      invalidateInFlightCartFetch: () => {
        _fetchPromise = null;
        _cartFetchEpoch += 1;
      },
      validateCart: async (newSessionStatus: string) => {
        const { sessionStatus } = get();
        if (sessionStatus !== newSessionStatus) {
          set({ sessionStatus: newSessionStatus });
          // Only clear cart on actual auth transitions (not initial mount)
          // On first mount, sessionStatus is null — this is initialization, not an auth change
          if (sessionStatus !== null) {
            get().invalidateInFlightCartFetch();
            set({
              currentCart: null,
              loading: true,
              error: null,
              lastShippingUpdate: null,
              pendingCurrencySync: null,
            });
            await get().fetchCart(false);
          }
        }
      },
      validateSite: async (newSiteCode: string) => {
        const run = async (): Promise<void> => {
          const { lastSiteCode, currentCart } = get();
          devSyncLog('cart-store: validateSite', {
            newSiteCode,
            lastSiteCode,
            cartSite: currentCart?.site,
            cartId: currentCart?.id,
          });
          if (lastSiteCode !== null && lastSiteCode !== newSiteCode) {
            get().invalidateInFlightCartFetch();
            // Do not set lastSiteCode to newSiteCode here: GET /api/cart can still echo the previous
            // session for one request — snapping lastSiteCode early makes cart.site vs session look
            // aligned and skips discard. lastSiteCode is updated from x-session-site-code in fetchCart.
            set({
              currentCart: null,
              loading: true,
              error: null,
              lastShippingUpdate: null,
              pendingCurrencySync: null,
            });
            await get().fetchCart(false);
          } else if (lastSiteCode === null) {
            // First session-site bind: record target site. (On lastSiteCode!==null transitions we avoid
            // setting lastSiteCode to the new URL before fetchCart — that snap hid stale cart/session pairs.)
            set({ lastSiteCode: newSiteCode });
            // Cart may already be loaded from SSR/page-load before the session's site
            // was reconciled (e.g., direct URL navigation to a different site). If the
            // existing cart belongs to a different site, clear and refetch.
            if (currentCart && currentCart.site && currentCart.site !== newSiteCode) {
              get().invalidateInFlightCartFetch();
              set({
                currentCart: null,
                loading: true,
                error: null,
                lastShippingUpdate: null,
                pendingCurrencySync: null,
              });
              await get().fetchCart(false);
            }
          } else if (
            lastSiteCode === newSiteCode &&
            currentCart &&
            currentCart.site &&
            currentCart.site !== newSiteCode
          ) {
            // lastSiteCode already matches session site but cart payload is from another tenant
            // (e.g. race with store-synchronizer or upstream returning a stale cart). Single refetch path.
            get().invalidateInFlightCartFetch();
            set({
              currentCart: null,
              loading: true,
              error: null,
              lastShippingUpdate: null,
              pendingCurrencySync: null,
            });
            await get().fetchCart(false);
          }
        };

        _validateSiteChain = _validateSiteChain.then(run).catch((err) => {
          getLogger().error({ err, newSiteCode }, 'validateSite failed');
        });
        await _validateSiteChain;
      },
      validateLegalEntity: async (newLegalEntityId: string | undefined) => {
        const normalized = newLegalEntityId?.trim() ?? '';
        const { lastLegalEntityId } = get();
        if (lastLegalEntityId !== null && lastLegalEntityId !== normalized) {
          get().invalidateInFlightCartFetch();
          set({
            lastLegalEntityId: normalized,
            currentCart: null,
            loading: true,
            error: null,
            lastShippingUpdate: null,
            pendingCurrencySync: null,
          });
          await get().fetchCart(false);
        } else if (lastLegalEntityId === null) {
          set({ lastLegalEntityId: normalized });
          // First bound session legal entity (e.g. B2B company selection): re-resolve cart server-side
          // so we never keep a cart from another company or from before LE context existed.
          if (normalized !== '') {
            get().invalidateInFlightCartFetch();
            set({
              currentCart: null,
              loading: true,
              error: null,
              lastShippingUpdate: null,
              pendingCurrencySync: null,
            });
            await get().fetchCart(false);
          }
        }
      },
      // State setters
      setCurrentCart: (cart: Cart | null | undefined) => {
        if (cart === get().currentCart) {
          return;
        }
        set({ currentCart: cart, loading: false });
      },
      getCurrentCart: () => get().currentCart,
      setLoading: (loading: boolean) => set({ loading }),
      getLoading: () => get().loading,
      setError: (error: Error | null) => set({ error }),

      // Cart API operations
      fetchCart: async (createCurrent: boolean = false) => {
        // Dedup: if a fetch is already in-flight, reuse it
        // A create=true call must NOT reuse a create=false in-flight request
        if (_fetchPromise && (createCurrent === _fetchPromiseCreate || !createCurrent)) {
          return _fetchPromise;
        }

        _fetchPromiseCreate = createCurrent;
        const currentFetchPromise = (async () => {
          const epochAtFetchStart = _cartFetchEpoch;
          try {
            set({ loading: true, error: null });

            try {
              const { cart: fetchedCart, sessionSiteCode } = await apiFetchCurrentCart(createCurrent);
              if (epochAtFetchStart !== _cartFetchEpoch) {
                return get().currentCart;
              }
              let cartData = fetchedCart;
              const expectedSite = get().lastSiteCode;

              // 1) Server inconsistency: cart tenant ≠ Emporix session.siteCode from the same GET /api/cart
              //    (`x-session-site-code`).
              if (cartData && sessionSiteCode && cartData.site && cartData.site !== sessionSiteCode) {
                devSyncLog('cart-store: fetchCart discarding cart/session site mismatch', {
                  cartSite: cartData.site,
                  sessionSiteCode,
                  cartId: cartData.id,
                });
                getLogger().warn(
                  { cartSite: cartData.site, sessionSiteCode },
                  'fetchCart received cart whose site does not match session site — discarding',
                );
                cartData = null;
              } else if (
                cartData &&
                !sessionSiteCode &&
                expectedSite &&
                cartData.site &&
                cartData.site !== expectedSite
              ) {
                // No header (legacy): fall back to lastSiteCode-only mismatch guard.
                devSyncLog('cart-store: fetchCart discarding wrong-site cart (no session header)', {
                  cartSite: cartData.site,
                  expectedSite,
                  cartId: cartData.id,
                });
                getLogger().warn(
                  { cartSite: cartData.site, expectedSite },
                  'fetchCart received cart from wrong site — discarding',
                );
                cartData = null;
              }

              if (epochAtFetchStart !== _cartFetchEpoch) {
                return get().currentCart;
              }
              const nextLastSite =
                (sessionSiteCode && sessionSiteCode.trim()) || (cartData?.site && String(cartData.site).trim()) || '';
              set({
                currentCart: cartData,
                loading: false,
                ...(nextLastSite ? { lastSiteCode: nextLastSite } : {}),
              });
              try {
                getLogger().info(
                  {
                    event: 'fetch_cart_snapshot',
                    cartId: cartData?.id ?? null,
                    site: cartData?.site ?? null,
                    currency: cartData?.currency ?? cartData?.totalPrice?.currency ?? null,
                    sessionId: cartData?.sessionId ?? null,
                    sessionSiteCode,
                    lastSiteCode: get().lastSiteCode,
                    createCurrent,
                  },
                  'fetchCart: cart id, site, currency, session id, and session header (single snapshot)',
                );
              } catch {
                /* logging must never clear cart state */
              }
              await get().flushPendingCurrencySync();
              return cartData;
            } catch (_err) {
              if (epochAtFetchStart !== _cartFetchEpoch) {
                return get().currentCart;
              }
              // Silent error when cart is gone
              set({ currentCart: null, loading: false });
              await get().flushPendingCurrencySync();
              return null;
            }
          } catch (err) {
            if (epochAtFetchStart !== _cartFetchEpoch) {
              return get().currentCart;
            }
            const error = err instanceof Error ? err : new Error('Failed to fetch cart');
            set({ error, loading: false });
            getLogger().error({ err }, 'Error fetching cart');
            await get().flushPendingCurrencySync();
            return undefined;
          }
        })();
        _fetchPromise = currentFetchPromise;

        // Clean up after completion — only clear if this is still the current in-flight promise
        // (prevents a later fetchCart(true) from being cleared by an earlier fetchCart(false) completing)
        void currentFetchPromise.finally(() => {
          if (_fetchPromise === currentFetchPromise) {
            _fetchPromise = null;
          }
        });

        return _fetchPromise;
      },

      loadCart: async (cartId: string, type: string = 'shopping') => {
        try {
          set({ loading: true, error: null });

          // Try to fetch existing cart
          try {
            const cartData = await loadSavedCart(cartId, type);
            set({ currentCart: cartData, loading: false });
            return cartData;
          } catch (_err) {
            // Silent error when cart is gone
            set({ currentCart: null, loading: false });
            return null;
          }
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Failed to fetch cart');
          set({ error, loading: false });
          getLogger().error({ err }, 'Error fetching cart');
          return undefined;
        }
      },

      addToCart: async (productId: string, quantity: number, _retryCount = 0) => {
        const { loading, lastSiteCode } = get();

        // Guard 1: Block while a site transition is in progress
        // (validateSite sets loading=true before async fetchCart)
        if (loading) {
          if (_retryCount >= 1) {
            throw new Error('Site transition in progress. Please try again.');
          }
          await new Promise((resolve) => setTimeout(resolve, 500));
          const { loading: stillLoading } = get();
          if (stillLoading) {
            throw new Error('Site transition in progress. Please try again.');
          }
          // Retry with fresh state after transition completes (max 1 retry)
          return get().addToCart(productId, quantity, _retryCount + 1);
        }

        // first get a cart (before we block with the loading state)
        let { currentCart } = get();
        if (!currentCart) {
          currentCart = await get().fetchCart(true);
          if (!currentCart) throw new Error('No cart available');
        }

        // Guard 2: Verify cart-site alignment using lastSiteCode from validateSite()
        if (lastSiteCode && currentCart.site && currentCart.site !== lastSiteCode) {
          getLogger().warn(
            { cartSite: currentCart.site, sessionSite: lastSiteCode },
            'Cart-site mismatch detected on client — clearing stale cart',
          );
          set({ currentCart: null, loading: true, error: null });
          await get().fetchCart(true);
          const { currentCart: correctCart } = get();
          if (!correctCart) {
            throw new Error('Failed to get correct site cart');
          }
          // Use the correct cart directly instead of recursing (max 1 retry)
          currentCart = correctCart;
        }

        set({ loading: true, error: null });

        try {
          const cartId = currentCart.id;

          // Call API to add item
          const result = await apiAddItemToCart(cartId, productId, quantity);

          // Update cart state with the result
          if (result.cart) {
            set({ currentCart: result.cart, loading: false });
          } else {
            // Refetch cart to get updated state if result doesn't include cart
            await get().fetchCart();
          }

          return result;
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Failed to add item to cart');
          set({ error, loading: false });
          getLogger().error({ err }, 'Error adding item to cart');
          throw err;
        }
      },

      updateItemQuantity: async (itemId: string, quantity: number) => {
        const { currentCart } = get();
        if (!currentCart) {
          await get().fetchCart();
          const updatedCart = get().currentCart;
          if (!updatedCart) throw new Error('No cart available');
        }

        try {
          set({ loading: true, error: null });
          const cart = get().currentCart;
          if (!cart) throw new Error('No cart available');

          // Call API to update item
          await apiUpdateCartItemQuantity(cart.id, itemId, quantity);

          // Refetch cart to get updated state
          await get().fetchCart();
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Failed to update cart item');
          set({ error, loading: false });
          getLogger().error({ err }, 'Error updating cart item');
        }
      },

      removeItem: async (itemId: string) => {
        const { currentCart } = get();
        if (!currentCart) {
          await get().fetchCart();
          const updatedCart = get().currentCart;
          if (!updatedCart) throw new Error('No cart available');
        }

        try {
          set({ loading: true, error: null });
          const cart = get().currentCart;
          if (!cart) throw new Error('No cart available');

          // Call API to remove item
          await apiRemoveCartItem(cart.id, itemId);

          // Refetch cart to get updated state
          await get().fetchCart();
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Failed to remove cart item');
          set({ error, loading: false });
          getLogger().error({ err }, 'Error removing cart item');
        }
      },

      updateShippingInfo: async (shippingAddress: CartShippingAddress, billingAddress?: CartShippingAddress) => {
        const afterPrevious = _shippingUpdateGate;
        let releaseNext!: () => void;
        _shippingUpdateGate = new Promise<void>((resolve) => {
          releaseNext = resolve;
        });
        await afterPrevious.catch(() => {});

        try {
          const { lastShippingUpdate } = get();
          const now = Date.now();
          const DEBOUNCE_TIME = 2000;

          if (
            lastShippingUpdate &&
            lastShippingUpdate.country === shippingAddress.country &&
            lastShippingUpdate.zipCode === shippingAddress.zipCode &&
            now - lastShippingUpdate.timestamp < DEBOUNCE_TIME
          ) {
            return;
          }

          set({
            loading: true,
            error: null,
            lastShippingUpdate: {
              country: shippingAddress.country,
              zipCode: shippingAddress.zipCode,
              timestamp: now,
            },
          });

          const { currentCart } = get();
          if (!currentCart) {
            await get().fetchCart();
            const updatedCart = get().currentCart;
            if (!updatedCart) return;
          }

          const cart = get().currentCart;
          if (!cart) {
            set({ loading: false });
            return;
          }

          await apiUpdateShippingInfo(cart.id, shippingAddress, billingAddress);

          await get().fetchCart();
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Failed to update shipping info');
          set({ error, loading: false });
          getLogger().error({ err }, 'Error updating shipping info');
        } finally {
          releaseNext();
        }
      },

      updateCurrency: async (currency: string) => {
        try {
          const { currentCart } = get();
          if (!currentCart) {
            await get().fetchCart();
            const updatedCart = get().currentCart;
            if (!updatedCart) return;
          }

          set({ loading: true, error: null });

          const cart = get().currentCart;
          if (!cart) return;

          await apiUpdateCartCurrency(cart.id, currency);
          await get().fetchCart(false);
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Failed to update cart currency');
          set({ error, loading: false });
          getLogger().error({ err }, 'Error updating cart currency');
        }
      },

      clearCart: (options?: { deleteCart?: boolean; clearSession?: boolean }) => {
        const { deleteCart = false, clearSession = true } = options ?? {};
        get().invalidateInFlightCartFetch();
        // 1. Optimistically reset all cart-related state immediately
        set({
          currentCart: null,
          loading: false,
          error: null,
          lastShippingUpdate: null,
          lastSiteCode: null,
          lastLegalEntityId: null,
          pendingCurrencySync: null,
        });
        // 2. Fire-and-forget: clear server-side session + optionally delete cart
        //    Skip server-side clear during login — the merge already set the correct cartId
        if (clearSession) {
          clearCartSession(deleteCart).catch((err) => {
            getLogger().error({ err }, 'Failed to clear cart session on server');
          });
        }
      },

      syncCurrencyWithSession: async (currency: string, siteCode: string) => {
        devSyncLog('cart-store: syncCurrencyWithSession', {
          currency,
          siteCode,
          cartSite: get().currentCart?.site,
          cartCurrency: get().currentCart?.currency ?? get().currentCart?.totalPrice?.currency,
          loading: get().loading,
        });
        // Queue retry intent while cart/session transitions are in-flight.
        if (get().loading) {
          const pendingCurrencySync = get().pendingCurrencySync;
          if (
            pendingCurrencySync &&
            pendingCurrencySync.currency === currency &&
            pendingCurrencySync.siteCode === siteCode &&
            pendingCurrencySync.attempts >= MAX_PENDING_CURRENCY_SYNC_RETRIES
          ) {
            getLogger().warn(
              { currency, siteCode, attempts: pendingCurrencySync.attempts },
              'Dropping pending currency sync after max retries',
            );
            return;
          }

          const nextAttempts =
            pendingCurrencySync &&
            pendingCurrencySync.currency === currency &&
            pendingCurrencySync.siteCode === siteCode
              ? pendingCurrencySync.attempts + 1
              : 1;
          set({
            pendingCurrencySync: {
              currency,
              siteCode,
              attempts: nextAttempts,
            },
          });
          return;
        }

        const { currentCart } = get();
        if (!currentCart) {
          return;
        }

        // Don't update if cart belongs to different site
        if (currentCart.site !== siteCode) {
          return;
        }

        const cartCurrency = currentCart.currency || currentCart.totalPrice?.currency;
        if (cartCurrency && cartCurrency !== currency) {
          await get().updateCurrency(currency);
        }

        // Clear stale intent once currencies converge.
        set({ pendingCurrencySync: null });
      },

      flushPendingCurrencySync: async () => {
        const pendingCurrencySync = get().pendingCurrencySync;
        if (!pendingCurrencySync || get().loading) {
          return;
        }

        set({ pendingCurrencySync: null });
        await get().syncCurrencyWithSession(pendingCurrencySync.currency, pendingCurrencySync.siteCode);
      },
    })),
  );
};
