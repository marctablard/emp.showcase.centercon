import { buildSearchParams, buildPaginatedResponse } from './common';
import { SearchParams } from '../../model';

describe('Common Utilities', () => {
  describe('buildSearchParams', () => {
    it('should build search parameters with all options', () => {
      const params: SearchParams<any> = {
        query: 'phone',
        page: 2,
        size: 15,
        sort: 'price:desc',
        locale: 'en',
        preset: 'popular-products',
        filters: {
          'attributes.brand': ['Samsung', 'Apple'],
          'categories': 'Electronics > Phones'
        }
      };
      
      const result = buildSearchParams(params);
      
      // Check that all parameters are included
      expect(result).toContain('q=phone');
      expect(result).toContain('page=2');
      expect(result).toContain('per_page=15');
      expect(result).toContain('sort=price%3Adesc');
      expect(result).toContain('v%5Blocale%5D=en');
      expect(result).toContain('preset=popular-products');
      
      // Check that array filters are handled correctly
      expect(result).toContain('f%5Battributes.brand%5D%5B%5D=Samsung');
      expect(result).toContain('f%5Battributes.brand%5D%5B%5D=Apple');
      
      // Check that string filters are handled correctly
      expect(result).toContain('f%5Bcategories%5D=Electronics+%3E+Phones');
    });

    it('should handle minimal parameters', () => {
      const params: SearchParams<any> = {
        query: 'phone'
      };
      
      const result = buildSearchParams(params);
      
      // Check that only the query parameter is included
      expect(result).toBe('q=phone');
    });

    it('should handle empty parameters', () => {
      const params: SearchParams<any> = {};
      
      const result = buildSearchParams(params);
      
      // Check that no parameters are included
      expect(result).toBe('');
    });
  });

  describe('buildPaginatedResponse', () => {
    it('should build paginated response from API response', async () => {
      const params: SearchParams<any> = {
        page: 2,
        size: 15
      };
      
      const response = {
        json: jest.fn().mockResolvedValue({
          hits: [{ document: { id: 'product1' } }, { document: { id: 'product2' } }],
          page: 2,
          per_page: 15,
          total: 100
        })
      } as unknown as Response;
      
      const result = await buildPaginatedResponse(params, response);
      
      // Check that the response is correctly formatted
      expect(result).toEqual({
        items: [{ id: 'product1' }, { id: 'product2' }],
        page: 2,
        size: 15,
        total: 100
      });
    });

    it('should use default values if not provided in response', async () => {
      const params: SearchParams<any> = {
        page: 2,
        size: 15
      };
      
      const response = {
        json: jest.fn().mockResolvedValue({
          hits: [{document: { id: 'product1' }}, {document: { id: 'product2' }}]
        })
      } as unknown as Response;
      
      const result = await buildPaginatedResponse(params, response);
      
      // Check that default values are used
      expect(result).toEqual({
        items: [{ id: 'product1' }, { id: 'product2' }],
        page: 2,
        size: 15,
        total: 0
      });
    });

    it('should handle empty results', async () => {
      const params: SearchParams<any> = {};
      
      const response = {
        json: jest.fn().mockResolvedValue({})
      } as unknown as Response;
      
      const result = await buildPaginatedResponse(params, response);
      
      // Check that empty results are handled correctly
      expect(result).toEqual({
        items: [],
        page: 0,
        size: 20,
        total: 0
      });
    });
  });
});
