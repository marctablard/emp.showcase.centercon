import { Mapper } from "../Mapper";
import { Order } from "./order";

/**
 * Interface for mapping between service order model and integration order model
 */
export interface OrderMapper<T> extends Mapper<T, Order> {

}