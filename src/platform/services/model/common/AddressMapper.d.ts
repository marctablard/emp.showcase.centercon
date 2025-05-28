import { Mapper } from "../Mapper";
import Address from "@/platform/services/model/common";

/**
 * Specialized mapper interface for transforming between external address data sources
 * and the internal Address domain model.
 * 
 * @template SOURCE_TYPE - The external address data format (typically from an API or data source)
 * @extends {Mapper<SOURCE_TYPE, Address>} - Extends the generic Mapper interface with Address as the service type
 */
export interface AddressMapper<SOURCE_TYPE> extends Mapper<SOURCE_TYPE, Address> {
    
}