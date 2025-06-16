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
}
