import { inject } from 'inversify';
import { injectable } from '@/platform/core/di/injectable';
import { EmporixLabel } from '@/platform/integrations/emporix/model';
import { Product as EmporixProduct } from '@/platform/integrations/emporix/model/product';
import type { EmporixBrandApi } from '@/platform/integrations/emporix/product/EmporixBrandApi';
import type { EmporixLabelApi } from '@/platform/integrations/emporix/product/EmporixLabelApi';
import type { ProductApi } from '@/platform/integrations/emporix/product/ProductApi';
import type { Paginated } from '@/platform/services/model/common';
import type { Product, ProductLabel } from '@/platform/services/model/product';
import type { ProductService } from '@/platform/services/product/ProductService';
import type { CategoryService } from '../../category/CategoryService';
import type { Category } from '../../model/category';
import type { ProductMapper } from '../../model/product/ProductMapper';

/**
 * Implementation of ProductService for Emporix product data.
 * Maps between Emporix API product format and internal Product model.
 */
@injectable('ProductService', 'Singleton')
class EmporixProductService implements ProductService {
  constructor(
    @inject('EmporixProductMapper') private productMapper: ProductMapper<EmporixProduct>,
    @inject('EmporixProductApi') private productApi: ProductApi,
    @inject('EmporixBrandApi') private brandApi: EmporixBrandApi,
    @inject('EmporixLabelApi') private labelApi: EmporixLabelApi,
    @inject('CategoryService') private categoryService: CategoryService,
  ) {}

  async getProductById(id: string): Promise<Product | undefined> {
    const product = await this.productApi.getProduct(id);
    if (!product) return undefined;

    // Map the base product
    const mappedProduct = this.productMapper.mapToService(product);

    // Get additional data (brands, labels, and categories)
    const { brandMap, labelMap, productCategoriesMap } = await this.getAdditionalData([product]);

    // Add brand information if available
    if (product.brandId) {
      const brand = brandMap.get(product.brandId);
      if (brand) {
        mappedProduct.brand = {
          name: brand.name,
          logo: {
            url: brand.image,
            altText: brand.name,
          },
        };
      }
    }

    // Add label information if available
    if (product.labelIds && product.labelIds.length > 0) {
      mappedProduct.labels = product.labelIds
        .map((labelId: string) => labelMap.get(labelId))
        .filter((label?: EmporixLabel) => label)
        .map((label: EmporixLabel) => this.mapLabel(label));
    }

    // Add categories if available
    const categories = productCategoriesMap.get(product.id);
    if (categories && categories.length > 0) {
      mappedProduct.categories = categories;
    }

    return mappedProduct;
  }

  async getProducts(page?: number, pageSize?: number): Promise<Paginated<Product>> {
    const paginated = await this.productApi.getProducts(page, pageSize);

    // Map all products first
    const mappedProducts = paginated.items.map((product: EmporixProduct) => this.productMapper.mapToService(product));

    // Get additional data (brands, labels, and categories)
    const { brandMap, labelMap, productCategoriesMap } = await this.getAdditionalData(paginated.items);

    // Enhance each product with brand, label, and category information
    mappedProducts.forEach((mappedProduct: Product, index: number) => {
      const originalProduct = paginated.items[index];

      // Add brand information
      if (originalProduct.brandId) {
        const brand = brandMap.get(originalProduct.brandId);
        if (brand) {
          mappedProduct.brand = {
            name: brand.name,
            logo: {
              url: brand.image,
              altText: brand.name,
            },
          };
        }
      }

      // Add label information
      if (originalProduct.labelIds && originalProduct.labelIds.length > 0) {
        mappedProduct.labels = originalProduct.labelIds
          .map((labelId: string) => labelMap.get(labelId))
          .filter((label?: EmporixLabel) => label)
          .map((label: EmporixLabel) => this.mapLabel(label));
      }

      // Add categories if available
      const categories = productCategoriesMap.get(originalProduct.id);
      if (categories && categories.length > 0) {
        // currently theres no way to determine the primary Category, so we use the first
        // this is important for SEO so canonical URLs don't change when the product is
        // being browsed to from different Categories
        mappedProduct.primaryCategory = categories[0];
        mappedProduct.categories = categories;
      }
    });

    return {
      items: mappedProducts,
      page: paginated.page,
      pageSize: paginated.size,
      total: paginated.total,
    };
  }

  /**
   * Maps an Emporix Label to the internal ProductLabel format
   */
  private mapLabel(label: EmporixLabel): ProductLabel {
    return {
      id: label.id,
      name: label.name,
      image: label.image || label.cloudinaryUrl,
      description: label.description,
      overlay: label.overlay,
    };
  }

  /**
   * Fetches additional data (brands, labels, and categories) for products
   * @param products The products to fetch additional data for
   * @returns Maps of brands, labels, and product categories
   */
  private async getAdditionalData(products: EmporixProduct[]): Promise<{
    brandMap: Map<string, any>;
    labelMap: Map<string, EmporixLabel>;
    productCategoriesMap: Map<string, Category[]>;
  }> {
    // Collect all brand IDs and label IDs from products
    const brandIds = new Set<string>();
    const labelIds = new Set<string>();
    const productIds = new Set<string>();

    products.forEach((product: EmporixProduct) => {
      if (product.brandId) brandIds.add(product.brandId);
      if (product.labelIds) product.labelIds.forEach((labelId: string) => labelIds.add(labelId));
      if (product.id) productIds.add(product.id);
    });

    // Fetch all brands, labels, and categories in parallel
    const [brands, labels, productCategoriesArray] = await Promise.all([
      Promise.all([...brandIds].map((id) => this.brandApi.getBrand(id))),
      Promise.all([...labelIds].map((id) => this.labelApi.getLabel(id))),
      Promise.all([...productIds].map((id) => this.categoryService.getCategoriesForProduct(id, true))),
    ]);

    // Create lookup maps for brands and labels
    const brandMap = new Map<string, any>();
    brands.filter(Boolean).forEach((brand: any) => brand && brandMap.set(brand.id, brand));

    const labelMap = new Map<string, EmporixLabel>();
    labels.filter(Boolean).forEach((label: EmporixLabel) => label && labelMap.set(label.id, label));

    // Create lookup map for product categories
    const productCategoriesMap = new Map<string, Category[]>();
    [...productIds].forEach((productId, index) => {
      productCategoriesMap.set(productId, productCategoriesArray[index] || []);
    });

    return { brandMap, labelMap, productCategoriesMap };
  }
}

export default EmporixProductService;
