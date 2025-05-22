export interface CartItem {
  id: string;
  itemYrn: string;
  quantity: number;
  effectiveQuantity?: number;
  type?: string;
  price?: {
    priceId?: string;
    originalAmount: number;
    effectiveAmount: number;
    currency: string;
  };
  product?: {
    id: string;
    name?: string;
    description?: string;
    sku?: string;
    images?: {
      id: string;
      url: string;
    }[];
  };
  tax?: {
    rate?: number;
    grossValue?: number;
    netValue?: number;
  };
}

export interface Cart {
  id: string;
  yrn?: string;
  customerId?: string;
  sessionId?: string;
  currency: string;
  siteCode: string;
  type?: string;
  status?: string;
  items?: CartItem[];
  totalPrice?: {
    amount: number;
    currency: string;
  };
  subTotalPrice?: {
    amount: number;
    currency: string;
  };
  totalUnitsCount?: number;
  metadata?: {
    createdAt: string;
    modifiedAt: string;
    calculatedAt?: string;
    version: number;
  };
  channel?: {
    name: string;
    source: string;
  };
}

export interface CreateCartRequest {
  customerId?: string;
  siteCode: string;
  currency: string;
  type?: string;
  channel?: {
    name: string;
    source: string;
  };
  sessionValidated?: boolean;
}

export interface CreatedCart {
  cartId: string;
  yrn: string;
}

export interface AddCartItemRequest {
  siteCode: string;
  itemYrn: string;
  quantity: number;
  itemType?: string;
  price?: {
    priceId?: string;
    effectiveAmount: number;
    originalAmount: number;
    currency: string;
  };
  tax?: {
    rate: number;
    grossValue: number;
    netValue: number;
  };
  product?: {
    id: string;
    name: string;
    description?: string;
    sku?: string;
    images?: {
      id: string;
      url: string;
    }[];
  };
}

export interface CreatedCartItem {
  itemId: string;
  yrn: string;
}

export interface UpdateCartItemRequest {
  itemYrn: string;
  quantity: number;
  price: {
    priceId?: string;
    effectiveAmount: number;
    originalAmount: number;
    currency: string;
  };
}
