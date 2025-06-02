import { Price, Tax } from '../common';
import { Product } from '../product';

export interface Cart {
  id: string;
  currency: string;
  site: string;
  legalEntity?: string;
  channel?: string;
  items: CartItem[];
  totalPrice: {
    amount: number;
    currency: string;
  };
  subTotalPrice: {
    amount: number;
    currency: string;
  };
  tax: Tax;
}

export interface CartItem {
  id: string;
  quantity: number;
  price: Price;
  product?: Partial<Product>;
  tax?: Tax;
}
