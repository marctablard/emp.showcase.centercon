import { Availability, LocalizedString, Media, Price, TaxType } from '../common';

export interface Product {
  id: string;
  name: string | LocalizedString;
  description: string | LocalizedString;
  sku?: string;
  brand?: {
    name: string | LocalizedString;
    logo?: Media;
  };
  price?: Price;
  availability?: Availability;
  primaryImage?: Media;
  images?: Media[];
  taxType?: TaxType;
}
