import { Price, Tax } from '../common';
import { Product } from '../product';

export interface Cart {
  id: string;
  currency: string;
  site: string;
  legalEntity?: string;
  channel?: string;
  items: CartItem[];
  shippingCosts?: Price;
  fees?: Price;
  totalPrice: Price;
  subTotalPrice: Price;
  tax: Tax;
}

export interface CartItem {
  id: string;
  quantity: number;
  price: Price;
  product?: Partial<Product>;
  tax?: Tax;
}
