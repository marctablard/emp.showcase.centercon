import { EmporixAddress } from './common';

/**
 * Order status types
 */
export type OrderStatus = 
  | 'IN_CHECKOUT'
  | 'CREATED'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'READY_FOR_PICKUP'
  | 'READY_FOR_SHIPPING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

/**
 * Order entry representing an item in the order
 */
export interface EmporixOrderEntry {
  id: string;
  itemYrn: string;
  amount: number;
  orderedAmount?: number;
  effectiveQuantity?: number;
  product?: {
    id: string;
    name: string;
    description?: string;
    sku?: string;
    images?: Array<{
      id: string;
      url: string;
    }>;
  };
  price?: {
    priceId?: string;
    effectiveAmount: number;
    originalAmount?: number;
    currency: string;
  };
  calculatedPrice?: {
    price: {
      netValue: number;
      grossValue: number;
      taxValue: number;
    };
    finalPrice: {
      netValue: number;
      grossValue: number;
      taxValue: number;
    };
  };
}

/**
 * Payment information for an order
 */
export interface EmporixPayment {
  status: string;
  method: string;
  paymentResponse?: string;
  paidAmount?: number;
  currency?: string;
  transactionId?: string;
  transactionDate?: string;
}

/**
 * Shipping information for an order
 */
export interface EmporixShipping {
  total: {
    amount: number;
    currency: string;
  };
  lines?: Array<{
    id: string;
    name?: string;
    description?: string;
    amount: number;
    currency: string;
  }>;
}

/**
 * Discount information for an order
 */
export interface EmporixDiscount {
  code: string;
  amount: number;
  currency: string;
  sequenceId?: number;
  description?: string;
}

/**
 * Calculated price information for an order
 */
export interface EmporixOrderCalculatedPrice {
  price: {
    netValue: number;
    grossValue: number;
    taxValue: number;
  };
  finalPrice: {
    netValue: number;
    grossValue: number;
    taxValue: number;
  };
}

/**
 * Customer information for an order
 */
export interface EmporixOrderCustomer {
  id: string;
  name?: string;
  title?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  company?: string;
  mixins?: Record<string, any>;
  metadata?: DefaultDtoMetadata;
}

/**
 * Emporix Order model
 */
export interface EmporixOrder {
  id: string;
  createdBy?: string;
  status: OrderStatus;
  lastStatusChange?: string;
  creationDate?: string;
  entries: EmporixOrderEntry[]
  customer: EmporixOrderCustomer;
  billingAddress?: EmporixAddress;
  shippingAddress?: EmporixAddress;
  payments?: EmporixPayment[];
  discounts?: EmporixDiscount[];
  calculatedPrice?: EmporixOrderCalculatedPrice;
  totalAuthorizedAmount?: number;
  siteCode?: string;
  currency?: string;
  sessionId?: string;
  customerId?: string;
  customerEmail?: string;
  customerNote?: string;
}

/**
 * Request to create a new order
 */
export interface CreateOrderRequest {
  cartId: string;
  billingAddress?: EmporixAddress;
  shippingAddress?: EmporixAddress;
  customerEmail?: string;
  customerNote?: string;
  payments?: EmporixPayment[];
}

/**
 * Response from creating an order
 */
export interface OrderCreationResponse {
  orderId: string;
  resourceLocation: string;
}

/**
 * Request to update an order
 */
export interface UpdateOrderRequest {
  status?: OrderStatus;
  billingAddress?: EmporixAddress;
  shippingAddress?: EmporixAddress;
  customerEmail?: string;
  customerNote?: string;
  payments?: EmporixPayment[];
}

/**
 * Order status transition
 */
export interface OrderStatusTransition {
  status: OrderStatus;
  availableTransitions: OrderStatus[];
}
