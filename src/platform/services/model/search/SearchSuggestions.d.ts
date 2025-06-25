import { Product } from '../product';

/**
 * Interface for category suggestion in search results
 */
export interface CategorySuggestion {
  name: string;
  count: number;
}

/**
 * Interface for search suggestions response including products, query completions, and categories
 */
export interface SearchSuggestions {
  queryCompletions: string[];
  products: Product[];
  categories: CategorySuggestion[];
}
