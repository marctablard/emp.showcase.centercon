import { act } from '@testing-library/react';
import { createCartStore } from '@/stores/cart-store';

// Mock the API calls
jest.mock('@/lib/client/carts', () => ({
  fetchCurrentCart: jest.fn(),
  addItemToCart: jest.fn(),
  removeCartItem: jest.fn(),
  updateCartItemQuantity: jest.fn(),
  updateShippingInfo: jest.fn(),
  loadSavedCart: jest.fn(),
}));

jest.mock('@/lib/logger/use-logger-client', () => ({
  getLogger: jest.fn(() => ({
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  })),
}));

const mockFetchCurrentCart = require('@/lib/client/carts').fetchCurrentCart;

describe('CartStore - Site Validation', () => {
  let store: ReturnType<typeof createCartStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    store = createCartStore();
  });

  describe('validateSite', () => {
    it('should set lastSiteCode on first call without clearing cart', async () => {
      // Arrange
      const initialCart = {
        id: 'cart-1',
        currency: 'EUR',
        site: 'site-a',
        items: [],
        totalPrice: { amount: 0, currency: 'EUR' },
        subTotalPrice: { amount: 0, currency: 'EUR' },
        tax: { amount: 0, currency: 'EUR', netValue: 0, grossValue: 0 },
      };

      // Set initial cart state
      act(() => {
        store.getState().setCurrentCart(initialCart);
      });

      // Act
      await act(async () => {
        await store.getState().validateSite('site-a');
      });

      // Assert
      expect(store.getState().lastSiteCode).toBe('site-a');
      expect(store.getState().currentCart).toEqual(initialCart);
      expect(mockFetchCurrentCart).not.toHaveBeenCalled();
    });

    it('should clear cart and refetch when site changes', async () => {
      // Arrange
      const initialCart = {
        id: 'cart-1',
        currency: 'EUR',
        site: 'site-a',
        items: [{ id: 'item-1', quantity: 1, price: { amount: 10, currency: 'EUR' } }],
        totalPrice: { amount: 10, currency: 'EUR' },
        subTotalPrice: { amount: 10, currency: 'EUR' },
        tax: { amount: 0, currency: 'EUR', netValue: 0, grossValue: 0 },
      };

      const newSiteCart = {
        id: 'cart-2',
        currency: 'USD',
        site: 'site-b',
        items: [],
        totalPrice: { amount: 0, currency: 'USD' },
        subTotalPrice: { amount: 0, currency: 'USD' },
        tax: { amount: 0, currency: 'USD', netValue: 0, grossValue: 0 },
      };

      mockFetchCurrentCart.mockResolvedValueOnce(newSiteCart);

      // Set initial cart and site
      act(() => {
        store.getState().setCurrentCart(initialCart);
      });

      await act(async () => {
        await store.getState().validateSite('site-a');
      });

      // Act - change site
      await act(async () => {
        await store.getState().validateSite('site-b');
      });

      // Assert
      expect(store.getState().lastSiteCode).toBe('site-b');
      expect(mockFetchCurrentCart).toHaveBeenCalledTimes(1);
      expect(store.getState().currentCart).toEqual(newSiteCart);
    });

    it('should not clear cart when called with same site', async () => {
      // Arrange
      const initialCart = {
        id: 'cart-1',
        currency: 'EUR',
        site: 'site-a',
        items: [{ id: 'item-1', quantity: 1, price: { amount: 10, currency: 'EUR' } }],
        totalPrice: { amount: 10, currency: 'EUR' },
        subTotalPrice: { amount: 10, currency: 'EUR' },
        tax: { amount: 0, currency: 'EUR', netValue: 0, grossValue: 0 },
      };

      // Set initial cart and site
      act(() => {
        store.getState().setCurrentCart(initialCart);
      });

      await act(async () => {
        await store.getState().validateSite('site-a');
      });

      // Act - call with same site again
      await act(async () => {
        await store.getState().validateSite('site-a');
      });

      // Assert
      expect(store.getState().lastSiteCode).toBe('site-a');
      expect(store.getState().currentCart).toEqual(initialCart);
      expect(mockFetchCurrentCart).not.toHaveBeenCalled();
    });

    it('should reset lastSiteCode to null when clearCart is called', async () => {
      // Arrange
      const initialCart = {
        id: 'cart-1',
        currency: 'EUR',
        site: 'site-a',
        items: [],
        totalPrice: { amount: 0, currency: 'EUR' },
        subTotalPrice: { amount: 0, currency: 'EUR' },
        tax: { amount: 0, currency: 'EUR', netValue: 0, grossValue: 0 },
      };

      // Set initial cart and site
      act(() => {
        store.getState().setCurrentCart(initialCart);
      });

      await act(async () => {
        await store.getState().validateSite('site-a');
      });

      expect(store.getState().lastSiteCode).toBe('site-a');

      // Act
      act(() => {
        store.getState().clearCart();
      });

      // Assert
      expect(store.getState().lastSiteCode).toBeNull();
      expect(store.getState().currentCart).toBeNull();
    });

    it('should set lastSiteCode before clearing cart to prevent race conditions', async () => {
      // Arrange
      const initialCart = {
        id: 'cart-1',
        currency: 'EUR',
        site: 'site-a',
        items: [],
        totalPrice: { amount: 0, currency: 'EUR' },
        subTotalPrice: { amount: 0, currency: 'EUR' },
        tax: { amount: 0, currency: 'EUR', netValue: 0, grossValue: 0 },
      };

      // Set initial cart and site
      act(() => {
        store.getState().setCurrentCart(initialCart);
      });

      await act(async () => {
        await store.getState().validateSite('site-a');
      });

      // Create a delayed mock to simulate slow network
      let resolvePromise: (cart: unknown) => void;
      const slowPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockFetchCurrentCart.mockReturnValueOnce(slowPromise);

      // Act - start site change but don't await
      const validatePromise = store.getState().validateSite('site-b');

      // Assert - lastSiteCode should be updated immediately (before fetch completes)
      expect(store.getState().lastSiteCode).toBe('site-b');
      expect(store.getState().currentCart).toBeNull();
      expect(store.getState().loading).toBe(true);

      // Complete the fetch
      resolvePromise!({
        id: 'cart-2',
        currency: 'USD',
        site: 'site-b',
        items: [],
        totalPrice: { amount: 0, currency: 'USD' },
        subTotalPrice: { amount: 0, currency: 'USD' },
        tax: { amount: 0, currency: 'USD', netValue: 0, grossValue: 0 },
      });

      await act(async () => {
        await validatePromise;
      });

      // Assert final state
      expect(store.getState().lastSiteCode).toBe('site-b');
    });

    it('should handle fetchCart failure during site change gracefully', async () => {
      // Arrange
      const initialCart = {
        id: 'cart-1',
        currency: 'EUR',
        site: 'site-a',
        items: [],
        totalPrice: { amount: 0, currency: 'EUR' },
        subTotalPrice: { amount: 0, currency: 'EUR' },
        tax: { amount: 0, currency: 'EUR', netValue: 0, grossValue: 0 },
      };

      // Set initial cart and site
      act(() => {
        store.getState().setCurrentCart(initialCart);
      });

      await act(async () => {
        await store.getState().validateSite('site-a');
      });

      // Mock fetch to throw error
      mockFetchCurrentCart.mockRejectedValueOnce(new Error('Network error'));

      // Act - change site (fetchCart handles error internally)
      await act(async () => {
        await store.getState().validateSite('site-b');
      });

      // Assert - lastSiteCode should still be updated, cart should be null
      expect(store.getState().lastSiteCode).toBe('site-b');
      expect(store.getState().currentCart).toBeNull();
    });
  });
});
