export interface ProductPrice {
  id: string;
  productId: string;
  currency: string;
  originalValue: number;
  effectiveValue: number;
  totalValue: number;
  quantity: {
    quantity: number;
    unitCode?: string;
  };
  includesTax: boolean;
  tax?: {
    taxClass: string;
    taxRate: number;
    netValue: number;
    grossValue: number;
    taxValue: number;
  };

  tierValues: {
    id: string;
    minQuantity: number;
    unit?: string;
    price: number;
  }[];
}
