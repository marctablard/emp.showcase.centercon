import type { Product } from "@/platform/services/model/product";
import type { Paginated } from "@/platform/services/model/common";
import type { ProductService } from "@/platform/services/product/ProductService";
import type { ProductApi } from "@/platform/integrations/emporix";
import { Product as EmporixProduct } from "@/platform/integrations/emporix/model/product";
import { injectable } from "@/platform/core/di/injectable";
import type { ProductMapper } from "../../model/product/ProductMapper";
import { inject } from "inversify";

/**
 * Implementation of ProductService for Emporix product data.
 * Maps between Emporix API product format and internal Product model.
 */
@injectable('ProductService', "Singleton")
class EmporixProductService implements ProductService {
    private productApi: ProductApi;
    private productMapper: ProductMapper<EmporixProduct>;
    
    constructor(
        @inject('EmporixProductMapper') productMapper: ProductMapper<EmporixProduct>,
        @inject('EmporixProductApi') productApi: ProductApi
    ) {
        this.productApi = productApi;
        this.productMapper = productMapper;
    }

    async getProductById(id: string): Promise<Product | undefined> {
        const product = await this.productApi.getProduct(id);
        return product ? this.productMapper.mapToService(product) : undefined;
    }
    
    async getProducts(page?: number, pageSize?: number): Promise<Paginated<Product>> {
        const paginated = await this.productApi.getProducts(page, pageSize);
        return {
            items: paginated.items.map((product : EmporixProduct) => this.productMapper.mapToService(product)),
            page: paginated.page,
            pageSize: paginated.size,
            total: paginated.total,
        };
    }
}


export default EmporixProductService;