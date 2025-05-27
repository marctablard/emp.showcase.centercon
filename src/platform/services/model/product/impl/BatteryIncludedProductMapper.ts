// c:\Workspace\emporix-showcase\src\platform\services\model\product\impl\BatteryIncludedProductMapper.ts
import { injectable } from "@/platform/core/di/injectable";
import { inject } from "inversify";
import { Product as ServiceProduct } from "@/platform/services/model/product";
import { BatteryIncludedProduct } from "@/platform/integrations/batteryincluded/model/product";
import { ProductMapper } from "../ProductMapper";
import { EmporixProductMapper } from "./EmporixProductMapper";

/**
 * Maps BatteryIncluded API product format to internal Product model.
 * Since BatteryIncluded uses Emporix as its data source, we can delegate
 * the mapping to the EmporixProductMapper.
 */
@injectable('BatteryIncludedProductMapper', "Singleton")
class BatteryIncludedProductMapper implements ProductMapper<BatteryIncludedProduct> {
  constructor(
    @inject('EmporixProductMapper') private emporixMapper: EmporixProductMapper
  ) {}
  
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
      medias: service.images ? service.images : []
    };
  }
}

export default BatteryIncludedProductMapper;