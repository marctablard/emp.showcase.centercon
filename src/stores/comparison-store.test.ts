import type { Product } from '@/platform/services/model/product';
import { MAX_COMPARISON_PRODUCTS, createComparisonStore } from './comparison-store';
import type { ComparisonStore } from './comparison-store';

// Provide an in-memory localStorage for zustand persist middleware
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

function makeProduct(id: string): Product {
  return {
    id,
    name: { en: `Product ${id}` },
    description: { en: `Description ${id}` },
    purchasable: true,
  } as Product;
}

describe('comparison-store', () => {
  let store: ReturnType<typeof createComparisonStore>;
  let getState: () => ComparisonStore;

  beforeEach(() => {
    localStorageMock.clear();
    store = createComparisonStore({ products: [] });
    getState = store.getState;
  });

  describe('addProduct', () => {
    it('adds a product and returns true', () => {
      const product = makeProduct('p1');
      const result = getState().addProduct(product);
      expect(result).toBe(true);
      expect(getState().products).toHaveLength(1);
      expect(getState().products[0].id).toBe('p1');
    });

    it('adds up to MAX_COMPARISON_PRODUCTS', () => {
      for (let i = 1; i <= MAX_COMPARISON_PRODUCTS; i++) {
        const result = getState().addProduct(makeProduct(`p${i}`));
        expect(result).toBe(true);
      }
      expect(getState().products).toHaveLength(MAX_COMPARISON_PRODUCTS);
    });

    it('rejects the 5th product and returns false', () => {
      for (let i = 1; i <= MAX_COMPARISON_PRODUCTS; i++) {
        getState().addProduct(makeProduct(`p${i}`));
      }
      const result = getState().addProduct(makeProduct('p5'));
      expect(result).toBe(false);
      expect(getState().products).toHaveLength(MAX_COMPARISON_PRODUCTS);
    });

    it('rejects duplicate product and returns false', () => {
      const product = makeProduct('p1');
      getState().addProduct(product);
      const result = getState().addProduct(product);
      expect(result).toBe(false);
      expect(getState().products).toHaveLength(1);
    });
  });

  describe('removeProduct', () => {
    it('removes an existing product by id', () => {
      getState().addProduct(makeProduct('p1'));
      getState().addProduct(makeProduct('p2'));
      getState().removeProduct('p1');
      expect(getState().products).toHaveLength(1);
      expect(getState().products[0].id).toBe('p2');
    });

    it('does nothing when removing a non-existent id', () => {
      getState().addProduct(makeProduct('p1'));
      getState().removeProduct('nonexistent');
      expect(getState().products).toHaveLength(1);
    });
  });

  describe('isInComparison', () => {
    it('returns true for an added product', () => {
      getState().addProduct(makeProduct('p1'));
      expect(getState().isInComparison('p1')).toBe(true);
    });

    it('returns false for a product not in comparison', () => {
      expect(getState().isInComparison('p1')).toBe(false);
    });
  });

  describe('clearComparison', () => {
    it('empties all products', () => {
      getState().addProduct(makeProduct('p1'));
      getState().addProduct(makeProduct('p2'));
      getState().clearComparison();
      expect(getState().products).toHaveLength(0);
    });
  });

  describe('getCount', () => {
    it('returns 0 for empty store', () => {
      expect(getState().getCount()).toBe(0);
    });

    it('returns correct count after adding products', () => {
      getState().addProduct(makeProduct('p1'));
      getState().addProduct(makeProduct('p2'));
      expect(getState().getCount()).toBe(2);
    });

    it('returns correct count after removing a product', () => {
      getState().addProduct(makeProduct('p1'));
      getState().addProduct(makeProduct('p2'));
      getState().removeProduct('p1');
      expect(getState().getCount()).toBe(1);
    });
  });
});
