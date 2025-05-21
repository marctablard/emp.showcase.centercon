import Product from "@/platform/types/data";
import { Mapper } from "../Mapper";

/**
 * Specialized mapper interface for transforming between external product data sources
 * and the internal Product domain model.
 * 
 * @template SOURCE_TYPE - The external product data format (typically from an API or data source)
 * @extends {Mapper<SOURCE_TYPE, Product>} - Extends the generic Mapper interface with Product as the service type
 */
export interface ProductMapper<SOURCE_TYPE> extends Mapper<SOURCE_TYPE, Product> {
    
}