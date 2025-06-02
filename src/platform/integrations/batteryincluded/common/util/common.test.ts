import { buildSearchParams } from './common';
import { BatteryIncludedSearchParams } from '../../model';

describe('Common Utilities', () => {
  describe('buildSearchParams', () => {
    it('should build search parameters with all options', () => {
      const params: BatteryIncludedSearchParams<any> = {
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
      const params: BatteryIncludedSearchParams<any> = {
        query: 'phone'
      };
      
      const result = buildSearchParams(params);
      
      // Check that query parameter and default pagination is included
      expect(result).toBe('q=phone&page=1&per_page=10');
    });

    it('should handle empty parameters', () => {
      const params: BatteryIncludedSearchParams<any> = {};
      
      const result = buildSearchParams(params);
      
      // Check that default pagination is included
      expect(result).toBe('page=1&per_page=10');
    });
  });

});
