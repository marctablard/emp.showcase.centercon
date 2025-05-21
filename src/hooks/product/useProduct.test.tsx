import { renderHook, act, waitFor } from '@testing-library/react';
import { useProduct } from './useProduct';
import { fetchProductById } from '@/lib/api/products';
import { StoreProvider, useProductStore } from '@/providers/StoreProvider';
import { ReactNode } from 'react';

// Mock the API module
jest.mock('@/lib/api/products', () => ({
  fetchProductById: jest.fn(),
}));

// Sample product data for testing
const mockProduct = {
  id: 'test-product-123',
  name: 'Test Product',
  description: 'This is a test product',
  price: {
    amount: 99.99,
    currency: 'USD'
  },
  images: ['https://example.com/image.jpg']
};

// Wrapper component to provide the store context
const wrapper = ({ children }: { children: ReactNode }) => (
  <StoreProvider>{children}</StoreProvider>
);

describe('useProduct hook', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  /**
   * Test 1: Dispatch product fetch → Store shows loaded state
   * 
   * This test verifies that when a product is fetched successfully,
   * the loading state transitions correctly and the product is stored.
   */
  test('should fetch product and update store with loaded state', async () => {
    // Mock the API response
    (fetchProductById as jest.Mock).mockResolvedValue(mockProduct);

    // Render the hook with the product ID
    const { result } = renderHook(() => useProduct('test-product-123'), { wrapper });

    // Initially, loading should be true
    expect(result.current.loading).toBe(true);
    expect(result.current.product).toBe(null);
    expect(result.current.error).toBe(null);

    // Wait for the fetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // After loading, product should be available and loading should be false
    expect(result.current.product).toEqual(mockProduct);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);

    // Verify that the API was called with the correct ID
    expect(fetchProductById).toHaveBeenCalledWith('test-product-123');
  });

  /**
   * Test 2: Simulate error during product fetch → Store shows error status
   * 
   * This test verifies that when a product fetch fails,
   * the error state is properly set and loading is completed.
   */
  test('should handle errors during product fetch', async () => {
    // Mock the API to throw an error
    const mockError = new Error('Failed to fetch product');
    (fetchProductById as jest.Mock).mockRejectedValue(mockError);

    // Render the hook with the product ID
    const { result } = renderHook(() => useProduct('test-product-123'), { wrapper });

    // Initially, loading should be true
    expect(result.current.loading).toBe(true);
    expect(result.current.product).toBe(null);
    expect(result.current.error).toBe(null);

    // Wait for the fetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // After error, error state should be set and loading should be false
    expect(result.current.product).toBe(null);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(mockError);

    // Verify that the API was called with the correct ID
    expect(fetchProductById).toHaveBeenCalledWith('test-product-123');
  });

  /**
   * Test 3: Other components correctly read state from the store
   * 
   * This test verifies that after using the useProduct hook,
   * the product is correctly stored in the Zustand store and
   * can be accessed by other components using useProductStore.
   */
  test('should populate the store so other components can access the product', async () => {
    // Mock the API response
    (fetchProductById as jest.Mock).mockResolvedValue(mockProduct);

    // First, render the useProduct hook to fetch and store the product
    const { result: hookResult } = renderHook(() => useProduct('test-product-123'), { wrapper });

    // Wait for the fetch to complete
    await waitFor(() => {
      expect(hookResult.current.loading).toBe(false);
    });

    // Now, render a hook that directly accesses the store
    const { result: storeResult } = renderHook(() => useProductStore(), { wrapper });

    // Verify that the product is in the store
    expect(storeResult.current.getProduct('test-product-123')).toEqual(mockProduct);

    // Test setting as current product
    act(() => {
      hookResult.current.setAsCurrent();
    });

    // Verify that the current product is set in the store
    expect(storeResult.current.getCurrentProduct()).toEqual(mockProduct);
  });

  test('should use cached product from store if available', async () => {
    // First, add a product to the store
    const { result: storeResult } = renderHook(() => useProductStore(), { wrapper });
    
    act(() => {
      storeResult.current.addProduct(mockProduct);
    });

    // Now, render the useProduct hook with the same product ID
    const { result: hookResult } = renderHook(() => useProduct('test-product-123'), { wrapper });

    // Product should be immediately available without loading
    expect(hookResult.current.product).toEqual(mockProduct);
    expect(hookResult.current.loading).toBe(false);
    
    // The API should not have been called
    expect(fetchProductById).not.toHaveBeenCalled();
  });

  test('refetch should work correctly', async () => {
    // Mock the API response
    const updatedProduct = { ...mockProduct, name: 'Updated Product' };
    (fetchProductById as jest.Mock).mockResolvedValueOnce(mockProduct);
    
    // Render the hook
    const { result } = renderHook(() => useProduct('test-product-123'), { wrapper });

    // Wait for the initial fetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Update the mock to return a different product
    (fetchProductById as jest.Mock).mockResolvedValueOnce(updatedProduct);

    // Call refetch
    act(() => {
      result.current.refetch();
    });

    // Loading should be true again
    expect(result.current.loading).toBe(true);

    // Wait for the refetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Product should be updated
    expect(result.current.product).toEqual(updatedProduct);
  });
});
