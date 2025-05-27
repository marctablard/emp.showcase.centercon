import { Product } from "@/platform/services/model/product";
import { cache } from "react";
import { SearchService } from "@/platform/services/search";
import { SearchParams, SearchResult } from "@/platform/services/model/common";

const getSearchService = () => globalThis.EMP.platform.ssr.get<SearchService>("SearchService");

const _searchProducts = cache(async (params: SearchParams<Product>) : Promise<SearchResult<Product>> => {
    const searchResult = await getSearchService().searchProducts(params)
    return searchResult || null;
  });

export function searchProducts(params: SearchParams<Product>) : Promise<SearchResult<Product>> {
  return _searchProducts(params);
}