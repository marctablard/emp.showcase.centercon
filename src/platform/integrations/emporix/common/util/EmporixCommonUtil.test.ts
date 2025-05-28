import EmporixCommonUtil from './EmporixCommonUtil';
import { EmporixConfig } from '../../config';

describe('EmporixCommonUtil', () => {
  const mockConfig: EmporixConfig = {
    tenant: 'test-tenant',
    baseUrl: 'https://api.emporix.io',
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret'
  };

  let commonUtil: EmporixCommonUtil;

  beforeEach(() => {
    commonUtil = new EmporixCommonUtil(mockConfig);
  });

  describe('generateProductYrn', () => {
    it('should generate a valid product YRN', () => {
      const productId = 'product-123';
      const expectedYrn = `urn:yaas:saasag:caasproduct:product:${mockConfig.tenant};${productId}`;
      
      const result = commonUtil.generateProductYrn(productId);
      
      expect(result).toEqual(expectedYrn);
    });
  });

  describe('generateCartYrn', () => {
    it('should generate a valid cart YRN', () => {
      const cartId = 'cart-123';
      const expectedYrn = `urn:yaas:hybris:cart:cart:${mockConfig.tenant};${cartId}`;
      
      const result = commonUtil.generateCartYrn(cartId);
      
      expect(result).toEqual(expectedYrn);
    });
  });

  describe('generateCartItemYrn', () => {
    it('should generate a valid cart item YRN', () => {
      const cartId = 'cart-123';
      const itemId = 'item-456';
      const expectedYrn = `urn:yaas:hybris:cart:cart-item:${mockConfig.tenant};${cartId}:${itemId}`;
      
      const result = commonUtil.generateCartItemYrn(cartId, itemId);
      
      expect(result).toEqual(expectedYrn);
    });
  });

  describe('extractIdFromYrn', () => {
    it('should extract the ID from a YRN', () => {
      const productId = 'product-123';
      const yrn = `urn:yaas:saasag:caasproduct:product:${mockConfig.tenant};${productId}`;
      
      const result = commonUtil.extractIdFromYrn(yrn);
      
      expect(result).toEqual(productId);
    });
  });
});
