import EmporixProductApi from './EmporixProductApi';
import EmporixApiInvoker from '../../common/impl/EmporixApiInvoker';
import { Product, PaginatedResponse, SearchParams } from '../../model';
import { EmporixConfig } from '../../config';
import { Container } from 'inversify';
import * as commonUtils from '../../common/util/common';
import EmporixOAuthApi from '../../oauth/impl/EmporixOAuthApi';
import { EmporixTokenManagerAbstract } from '../../common/impl/EmporixTokenManagerAbstract';
import { StoredToken } from '@/platform/integrations/types/auth';
import { TokenManager } from '../../common/TokenManager';

// Create a test config implementation
class TestEmporixConfig implements EmporixConfig {
  baseUrl: string = process.env.NEXT_EMPORIX_TEST_BASE_URL || 'https://api.emporix.io';
  tenant: string = process.env.NEXT_EMPORIX_TEST_TENANT || '';
  clientId: string = process.env.NEXT_EMPORIX_TEST_CLIENT_ID || '';
  clientSecret: string = process.env.NEXT_EMPORIX_TEST_CLIENT_SECRET || '';
}

class TestTokenManager extends EmporixTokenManagerAbstract {
  private tokenStore: Map<string, StoredToken<any>> = new Map();
  protected async readToken<T extends StoredToken<K>, K>(type: 'anonymous' | 'customer' | 'service'): Promise<T | undefined> {
    return this.tokenStore.get(type) as T | undefined;
  }
  protected writeToken<T extends StoredToken<K>, K>(type: 'anonymous' | 'customer' | 'service', token: T): Promise<void> {
    this.tokenStore.set(type, token);
    return Promise.resolve();
  }
  public clearTokens(): void {
    this.tokenStore.clear();
  }
}



const sampleSingleProduct: Product = {
  id: '1',
  code: 'c1',
  name: { 'en': 'Test Product 1 EN' },
  description: { 'en': 'Test Product 1 Description EN' },
  published: true
};


// Sample product data for tests
const sampleProductsData: Product[] = [
  sampleSingleProduct,
  {
    id: '2',
    code: 'c2',
    name: { 'en': 'Test Product 2 EN' },
    description: { 'en': 'Test Product 2 Description EN' },
    published: true
  }
];

describe('EmporixProductApi', () => {
  let container: Container;
  let productApi: EmporixProductApi;
  let apiInvoker: EmporixApiInvoker;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up the container with our test config
    container = new Container();
    const test = new TestEmporixConfig();
    container.bind<EmporixConfig>('EmporixConfig').to(TestEmporixConfig);
    container.bind<EmporixOAuthApi>('EmporixOAuthApi').to(EmporixOAuthApi);
    container.bind<TokenManager>('EmporixTokenManager').to(TestTokenManager);
    container.bind<EmporixApiInvoker>('EmporixApiInvoker').to(EmporixApiInvoker);
    container.bind<EmporixProductApi>('EmporixProductApi').to(EmporixProductApi);
    
    // Get instances from the container
    apiInvoker = container.get<EmporixApiInvoker>('EmporixApiInvoker');
    productApi = container.get<EmporixProductApi>('EmporixProductApi');
    
    // Mock the authenticatedFetch method on the real apiInvoker
    jest.spyOn(apiInvoker, 'authenticatedFetch');
  });
  
  describe('getProducts', () => {
    it('should fetch products with default pagination parameters', async () => {
      // Setup mocks
      const mockQuery = 'pageSize=20';
      // Execute
      const result = await productApi.getProducts();
      
      expect(apiInvoker.authenticatedFetch).toHaveBeenCalledWith(
        `/product/showcasetest/products?${mockQuery}`,
        { method: 'GET' }
      );
    });
    
    it('should fetch products with custom pagination parameters', async () => {
      // Setup mocks
      const mockQuery = 'pageNumber=2&pageSize=10';

      // Execute
      const result = await productApi.getProducts(2, 10);
      
      expect(apiInvoker.authenticatedFetch).toHaveBeenCalledWith(
        `/product/showcasetest/products?${mockQuery}`,
        { method: 'GET' }
      );
    });
  });
  
  describe('searchProducts', () => {
    it('should search products with provided search parameters', async () => {
      // Setup mocks
      const searchParams: SearchParams<Product> = {
        query: 'test',
        page: 0,
        size: 20,
        criteria: {
          name: 'Test'
        }
      };
      
      const mockQuery = 'pageSize=20';
      const mockBody = 'name:Test';
      
      // Execute
      const result = await productApi.searchProducts(searchParams);
      
      expect(apiInvoker.authenticatedFetch).toHaveBeenCalledWith(
        `/product/showcasetest/products?${mockQuery}`,
        {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'X-Total-Count': 'true' },
          body: JSON.stringify({ 'q': mockBody })
        }
      );
    });
  });
  
  describe('getProduct', () => {
    it('should fetch a single product by ID', async () => {
      // Setup mocks
      const productId = '1';
      
      // Execute
      const result = await productApi.getProduct(productId);
      if (!result) {
        fail('Product not found');
      }
      // Assert
      expect(apiInvoker.authenticatedFetch).toHaveBeenCalledWith(
        `/product/showcasetest/products/${productId}`,
        { method: 'GET' }
      );
      
      expect(result.id).toEqual(sampleSingleProduct.id);
      expect(result.code).toEqual(sampleSingleProduct.code);
      expect(result.name).toEqual(sampleSingleProduct.name);
      expect(result.description).toEqual(sampleSingleProduct.description);
    });
    
    it('should handle errors when fetching a product', async () => {
      // Setup mocks
      const productId = 'non-existent-product';
      const result = await productApi.getProduct(productId);
      expect(apiInvoker.authenticatedFetch).toHaveBeenCalledWith(
        `/product/showcasetest/products/${productId}`,
        { method: 'GET' }
      );
      // Execute and assert
      await expect(result).toBeUndefined();
      
    });
  });
  
  describe('error handling', () => {
    it('should handle API errors in getProducts', async () => {
      // Setup mocks
      (apiInvoker.authenticatedFetch as jest.Mock).mockRejectedValue(new Error('API Error'));
      
      // Execute and assert
      await expect(productApi.getProducts()).rejects.toThrow('API Error');
    });
    
    it('should handle API errors in searchProducts', async () => {
      // Setup mocks
      (apiInvoker.authenticatedFetch as jest.Mock).mockRejectedValue(new Error('API Error'));
      
      // Execute and assert
      await expect(productApi.searchProducts({
        query: 'test'
      })).rejects.toThrow('API Error');
    });
  });
});
