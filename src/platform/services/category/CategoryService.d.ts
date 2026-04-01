export interface CategoryService {
  getCategoryById(id: string): Promise<Category | null>;

  getCategoryBySlug(slug: string): Promise<Category | null>;

  getCategoryByCode(code: string): Promise<Category | null>;

  getCategories(): Promise<Category[]>;

  getCategoryParents(categoryId: string): Promise<Category[]>;

  getCategorySubcategories(categoryId: string): Promise<Category[]>;

  /**
   * Get categories assigned to a product by its ID
   * @param productId The product ID
   * @param includeParents Whether to include parent categories
   * @returns Promise with an array of categories
   */
  getCategoriesForProduct(productId: string, includeParents?: boolean): Promise<Category[]>;

  /**
   * Get a complete category tree for a root category
   * @param categoryId The ID of the root category
   * @param showUnpublished Whether to include unpublished categories
   * @returns Promise with the category tree or null if not found
   */
  getCategoryTree(categoryId: string, showUnpublished?: boolean): Promise<Category | null>;

  /**
   * Retrieve all category trees for the tenant.
   * Calls GET /category/{tenant}/category-trees with a customer token.
   * Each returned Category already has its children populated recursively.
   * Site-filtering is done by the caller using catalog categoryIds.
   */
  getCategoryTrees(): Promise<Category[]>;

  /**
   * Get the product IDs assigned to a category.
   * @param categoryId The category ID
   * @param options Pagination options
   * @returns The product IDs and total count
   */
  getProductIdsForCategory(
    categoryId: string,
    options?: { page?: number; pageSize?: number },
  ): Promise<{ ids: string[]; total: number; page: number; pageSize: number }>;
}
