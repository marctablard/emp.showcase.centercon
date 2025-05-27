// c:\Workspace\emporix-showcase\src\platform\services\search\impl\BatteryIncludedSearchService.ts
import type { Product } from "@/platform/services/model/product";
import type { SearchResult, SearchParams, Filter, FilterValue } from "@/platform/services/model/common";
import type { SearchService } from "@/platform/services/search/SearchService";
import type { ShopApi } from "@/platform/integrations/batteryincluded/shop/ShopApi";
import { BatteryIncludedProduct } from "@/platform/integrations/batteryincluded/model/product";
import { injectable } from "@/platform/core/di/injectable";
import { inject } from "inversify";
import type { ProductMapper } from "../../model/product/ProductMapper";
import type { BatteryIncludedSearchResponse } from "@/platform/integrations/batteryincluded/model";

/**
 * Implementation of SearchService for BatteryIncluded product data.
 * Maps between BatteryIncluded API product format and internal Product model.
 */
@injectable('SearchService', "Singleton")
class BatteryIncludedSearchService implements SearchService {
  private shopApi: ShopApi;
  private productMapper: ProductMapper<BatteryIncludedProduct>;

  constructor(
    @inject('BatteryIncludedShopApi') shopApi: ShopApi,
    @inject('BatteryIncludedProductMapper') productMapper: ProductMapper<BatteryIncludedProduct>
  ) {
    this.shopApi = shopApi;
    this.productMapper = productMapper;
  }

  async searchProducts(params: SearchParams<Product>): Promise<SearchResult<Product>> {
    const searchResult: BatteryIncludedSearchResponse<BatteryIncludedProduct> = await this.shopApi.browse({
      page: (params.page || 0) + 1, // normalize page
      size: params.size,
      query: params.query,
      sort: params.sort,
      filters: params.filters
    });
    const availableFilters = searchResult.facet_counts.map((facet) => {
      const filter: Filter = {
        id: facet.field_name,
        name: facet.field_name, // TODO handle l10n when we have a representative Dataset
        values: facet.counts ? facet.counts.map((value) => ({
          id: value.value,
          name: value.value, // TODO l10n...
          count: value.count,
          active: params.filters ? params.filters[facet.field_name] == value.value : false
        })) : []
      }
      return filter;
    })
    return {
      items: searchResult.hits.map((hit) => this.productMapper.mapToService(hit.document)),
      page: searchResult.page - 1,
      pageSize: params.size || 10, // default
      total: searchResult.found,
      availableFilters: availableFilters
    };
  }

  async getSuggestions(query: string, locale?: string): Promise<string[]> {
    const suggestions = await this.shopApi.suggest(query, locale);

    // Extract the text from suggestions
    return suggestions.map(suggestion => suggestion.text);
  }

  async getHighlights(): Promise<Product[]> {
    const _highlights = await this.shopApi.getHighlights();

    // Extract products from highlights and map them
    return []

    /*
    TODO need to clarify, since Documentation is lacking details

    return highlights
      .flatMap(highlight => highlight.products || [])
      .map(product => mapper.mapToService(product));
    */
  }

  async getRecommendations(productId: string): Promise<Product[]> {
    const recommendations = await this.shopApi.getRecommendations(productId);

    return recommendations.map(product => this.productMapper.mapToService(product));
  }
}

export default BatteryIncludedSearchService;