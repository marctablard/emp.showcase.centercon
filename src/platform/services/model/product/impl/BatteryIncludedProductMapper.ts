// c:\Workspace\emporix-showcase\src\platform\services\model\product\impl\BatteryIncludedProductMapper.ts
import { inject } from 'inversify';
import { injectable } from '@/platform/core/di/injectable';
import { BatteryIncludedProduct } from '@/platform/integrations/batteryincluded/model/product';
import { Product as ServiceProduct } from '@/platform/services/model/product';
import { CategorySuggestion, SearchSuggestions } from '../../search/SearchSuggestions';
import { SuggestionsMapper } from '../../search/SuggestionsMapper';
import { ProductMapper } from '../ProductMapper';
import { EmporixProductMapper } from './EmporixProductMapper';

/**
 * Maps BatteryIncluded API product format to internal Product model.
 * Since BatteryIncluded uses Emporix as its data source, we can delegate
 * the mapping to the EmporixProductMapper.
 */
@injectable('BatteryIncludedProductMapper', 'Singleton')
class BatteryIncludedProductMapper implements ProductMapper<BatteryIncludedProduct>, SuggestionsMapper {
  constructor(@inject('EmporixProductMapper') private emporixMapper: EmporixProductMapper) {}

  /**
   * Maps a BatteryIncluded product to the internal Product model by delegating to EmporixProductMapper
   * @param product - The BatteryIncluded product data
   * @returns The internal Product model
   */
  mapToService(product: BatteryIncludedProduct): ServiceProduct {
    // Since BatteryIncluded uses the same structure as Emporix, delegate to EmporixProductMapper
    // custom modifications can be included here
    const result = this.emporixMapper.mapToService({
      ...product,
      media: product.medias ? product.medias : [],
    });
    return result;
  }

  /**
   * Maps an internal Product model back to BatteryIncluded product format
   * @param service - The internal Product model
   * @returns The BatteryIncluded product data
   */
  mapToSource(service: ServiceProduct): BatteryIncludedProduct {
    // Delegate to EmporixProductMapper since they share the same structure
    // custom modifications can be included here
    const result = this.emporixMapper.mapToSource(service);
    return {
      ...result,
      medias: service.images ? service.images : [],
    };
  }

  /**
   * Maps query completions from the API response
   * @param item - The query completion item from the API response
   * @returns Array of query completion strings
   */
  mapQueryCompletions(item: any): string[] {
    const completions: string[] = [];

    if (item && item.kind === 'query-completion' && Array.isArray(item.hits)) {
      item.hits.forEach((hit: any) => {
        if (hit && hit.value) {
          completions.push(hit.value);
        }
      });
    }

    return completions;
  }

  /**
   * Maps category suggestions from the API response
   * @param item - The category facet item from the API response
   * @returns Array of category suggestions
   */
  mapCategorySuggestions(item: any): CategorySuggestion[] {
    const categories: CategorySuggestion[] = [];

    if (item && item.kind?.startsWith('facet.categoryAssignments') && Array.isArray(item.hits)) {
      item.hits.forEach((hit: any) => {
        if (hit && hit.value) {
          categories.push({
            name: hit.value,
            count: hit.count || 1,
          });
        }
      });
    }

    return categories;
  }

  /**
   * Maps product suggestions from the API response
   * @param item - The document item from the API response
   * @returns Array of product models
   */
  mapProductSuggestions(item: any): ServiceProduct[] {
    const products: ServiceProduct[] = [];

    if (item && item.kind === 'document' && Array.isArray(item.hits)) {
      item.hits.forEach((hit: any) => {
        if (hit && hit.highlighted) {
          const product = this.mapToService(hit.highlighted);
          products.push(product);
        }
      });
    }

    return products;
  }

  /**
   * Maps the complete API response to a search suggestions object
   * @param apiResponse - The complete API response array
   * @returns Search suggestions object containing query completions, products, and categories
   */
  mapSearchSuggestions(apiResponse: any[]): SearchSuggestions {
    const result: SearchSuggestions = {
      queryCompletions: [],
      products: [],
      categories: [],
    };

    if (!Array.isArray(apiResponse)) {
      return result;
    }

    apiResponse.forEach((item) => {
      if (item.kind === 'query-completion') {
        result.queryCompletions = [...result.queryCompletions, ...this.mapQueryCompletions(item)];
      } else if (item.kind === 'document') {
        result.products = [...result.products, ...this.mapProductSuggestions(item)];
      } else if (item.kind?.startsWith('facet.categoryAssignments')) {
        result.categories = [...result.categories, ...this.mapCategorySuggestions(item)];
      }
    });

    return result;
  }
}

export default BatteryIncludedProductMapper;
