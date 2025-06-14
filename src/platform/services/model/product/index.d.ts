import { Category } from '../category';
import { Availability, LocalizedString, Media, Price, TaxType } from '../common';

export interface ProductLabel {
  id: string;
  name: string;
  image?: string;
  description?: string | LocalizedString;
  overlay?: {
    isTrue?: boolean;
    position: number;
  };
}

export interface Product {
  id: string;
  name: string | LocalizedString;
  description: string | LocalizedString;
  sku?: string;
  brand?: {
    name: string | LocalizedString;
    logo?: Media;
  };
  primaryCategory?: Category;
  categories?: Category[];
  labels?: ProductLabel[];
  price?: Price;
  availability?: Availability;
  primaryImage?: Media;
  images?: Media[];
  taxType?: TaxType;
}
