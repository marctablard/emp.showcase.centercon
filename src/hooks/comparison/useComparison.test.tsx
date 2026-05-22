import { act, renderHook } from '@testing-library/react';
import type { Product } from '@/platform/services/model/product';
import { MAX_COMPARISON_PRODUCTS } from '@/stores/comparison-store';
import { useComparison } from './useComparison';

function makeProduct(id: string): Product {
  return {
    id,
    name: { en: `Product ${id}` },
    description: { en: `Description ${id}` },
    purchasable: true,
  } as Product;
}

const mockProducts: Product[] = [];
const mockAddProduct = jest.fn();
const mockRemoveProduct = jest.fn();
const mockIsInComparison = jest.fn();
const mockClearComparison = jest.fn();
const mockGetCount = jest.fn();

jest.mock('@/providers/StoreProvider', () => ({
  useComparisonStore: () => ({
    products: mockProducts,
    addProduct: mockAddProduct,
    removeProduct: mockRemoveProduct,
    isInComparison: mockIsInComparison,
    clearComparison: mockClearComparison,
    getCount: mockGetCount,
  }),
}));

describe('useComparison', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockProducts.length = 0;
    mockGetCount.mockReturnValue(0);
    mockIsInComparison.mockReturnValue(false);
    mockAddProduct.mockReturnValue(true);
  });

  it('toggleProduct adds when product is not present', () => {
    mockIsInComparison.mockReturnValue(false);
    const product = makeProduct('p1');

    const { result } = renderHook(() => useComparison());
    act(() => {
      result.current.toggleProduct(product);
    });

    expect(mockAddProduct).toHaveBeenCalledWith(product);
    expect(mockRemoveProduct).not.toHaveBeenCalled();
  });

  it('toggleProduct removes when product is already present', () => {
    mockIsInComparison.mockReturnValue(true);
    const product = makeProduct('p1');

    const { result } = renderHook(() => useComparison());
    act(() => {
      result.current.toggleProduct(product);
    });

    expect(mockRemoveProduct).toHaveBeenCalledWith('p1');
    expect(mockAddProduct).not.toHaveBeenCalled();
  });

  it('isFull returns true when store has MAX_COMPARISON_PRODUCTS', () => {
    for (let i = 1; i <= MAX_COMPARISON_PRODUCTS; i++) {
      mockProducts.push(makeProduct(`p${i}`));
    }
    mockGetCount.mockReturnValue(MAX_COMPARISON_PRODUCTS);

    const { result } = renderHook(() => useComparison());
    expect(result.current.isFull).toBe(true);
  });

  it('isFull returns false when store has fewer than MAX products', () => {
    mockProducts.push(makeProduct('p1'));
    mockGetCount.mockReturnValue(1);

    const { result } = renderHook(() => useComparison());
    expect(result.current.isFull).toBe(false);
  });

  it('count reflects store getCount()', () => {
    mockGetCount.mockReturnValue(3);

    const { result } = renderHook(() => useComparison());
    expect(result.current.count).toBe(3);
  });
});
