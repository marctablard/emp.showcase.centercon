import { EmporixOrder, CreateOrderRequest, OrderCreationResponse, UpdateOrderRequest } from '../model/order';

/**
 * Interface for Order API operations
 */
export default interface OrderApi {
  // Tenant-managed endpoints (using service token)
  
  /**
   * Create a new order from a cart (tenant-managed endpoint)
   * @param createOrderRequest Order creation request
   * @returns Promise with the created order ID
   */
  createOrder(createOrderRequest: CreateOrderRequest): Promise<OrderCreationResponse>;

  /**
   * Get order by ID (tenant-managed endpoint)
   * @param orderId Order ID
   * @returns Promise with the order details
   */
  getOrder(orderId: string): Promise<EmporixOrder | null>;

  /**
   * Get orders with optional filtering (tenant-managed endpoint)
   * @param pageSize Optional page size
   * @param pageNumber Optional page number
   * @param sort Optional sort criteria
   * @param query Optional query filter
   * @returns Promise with array of orders
   */
  getOrders(pageSize?: number, pageNumber?: number, sort?: string, query?: string): Promise<EmporixOrder[]>;

  /**
   * Update an order (tenant-managed endpoint)
   * @param orderId Order ID
   * @param updateRequest Update request with order information
   * @returns Promise resolving when update is complete
   */
  updateOrder(orderId: string, updateRequest: UpdateOrderRequest): Promise<void>;

  /**
   * Delete an order (tenant-managed endpoint)
   * @param orderId Order ID
   * @returns Promise resolving when deletion is complete
   */
  deleteOrder(orderId: string): Promise<void>;
  
  /**
   * Get order status transitions (tenant-managed endpoint)
   * @param orderId Order ID
   * @returns Promise with available status transitions
   */
  getOrderStatusTransitions(orderId: string): Promise<string[]>;
  
  // Customer-managed endpoints (using session token)
  
  /**
   * Create a new customer order from a cart (customer-managed endpoint)
   * @param createOrderRequest Order creation request
   * @returns Promise with the created order ID
   */
  createCustomerOrder(createOrderRequest: CreateOrderRequest): Promise<OrderCreationResponse>;

  /**
   * Get customer order by ID (customer-managed endpoint)
   * @param orderId Order ID
   * @returns Promise with the order details
   */
  getCustomerOrder(orderId: string): Promise<EmporixOrder | null>;

  /**
   * Get customer orders with optional filtering (customer-managed endpoint)
   * @param pageSize Optional page size
   * @param pageNumber Optional page number
   * @param sort Optional sort criteria
   * @param query Optional query filter
   * @returns Promise with array of orders
   */
  getCustomerOrders(pageSize?: number, pageNumber?: number, sort?: string, query?: string): Promise<EmporixOrder[]>;

  /**
   * Update a customer order (customer-managed endpoint)
   * @param orderId Order ID
   * @param updateRequest Update request with order information
   * @returns Promise resolving when update is complete
   */
  updateCustomerOrder(orderId: string, updateRequest: UpdateOrderRequest): Promise<void>;

  /**
   * Delete a customer order (customer-managed endpoint)
   * @param orderId Order ID
   * @returns Promise resolving when deletion is complete
   */
  deleteCustomerOrder(orderId: string): Promise<void>;
  
  /**
   * Get customer order status transitions (customer-managed endpoint)
   * @param orderId Order ID
   * @returns Promise with available status transitions
   */
  getCustomerOrderStatusTransitions(orderId: string): Promise<string[]>;
}