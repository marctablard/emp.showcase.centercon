import { Cart, CartItem } from "./cart";
import { Mapper } from "../Mapper";

/**
 * Specialized mapper interface for transforming between external cart data sources
 * and the internal Cart domain model.
 * 
 * @template SOURCE_TYPE - The external cart data format (typically from an API or data source)
 * @template SOURCE_ITEM_TYPE - The external cart item format
 * @extends {Mapper<SOURCE_TYPE, Cart>} - Extends the generic Mapper interface with Cart as the service type
 */
export interface CartMapper<SOURCE_TYPE, SOURCE_ITEM_TYPE> extends Mapper<SOURCE_TYPE, Cart> {

  /**
   * Maps an external cart item to a service cart item
   * 
   * @param sourceItem - The cart item in source format
   * @returns The cart item in service format
   */
  mapCartItemToService(sourceItem: SOURCE_ITEM_TYPE): CartItem;
}
