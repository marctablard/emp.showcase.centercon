
import apis from "@/platform/integrations/index";
import type { Product } from "@/platform/services/model/product";
import type { Paginated } from "@/platform/services/model/common";
import type { ProductService } from "@/platform/services/product/ProductService";
import type { ProductApi } from "@/platform/integrations/emporix";
import { Product as EmporixProduct } from "@/platform/integrations/emporix/model/product";
import services from "@/platform/services";
import { injectable } from "@/platform/core/di/injectable";
import { ProductMapper } from "../../model/product/ProductMapper";

/**
 * Implementation of ProductService for Emporix product data.
 * Maps between Emporix API product format and internal Product model.
 */
@injectable('ProductService', 'Singleton')
class EmporixProductService implements ProductService {

    async getProductById(id: string): Promise<Product | undefined> {
        const mapper = await services.get<ProductMapper<EmporixProduct>>('EmporixProductMapper');
        const productApi : ProductApi = await apis.get('EmporixProductApi');
        const product = await productApi.getProduct(id);
        return product ? mapper.mapToService(product) : undefined;
    }
    
    async getProducts(page?: number, pageSize?: number): Promise<Paginated<Product>> {
        const productApi : ProductApi = await apis.get('EmporixProductApi');
        const paginated = await productApi.getProducts(page, pageSize);
        const mapper = await services.get<ProductMapper<EmporixProduct>>('EmporixProductMapper');
        return {
            items: paginated.items.map(product => mapper.mapToService(product)),
            page: paginated.page,
            pageSize: paginated.size,
            total: paginated.total,
        };
    }
}


export default EmporixProductService;