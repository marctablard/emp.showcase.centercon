import { LocalizedString, Media, Price, TaxType } from '../common';

export interface Product {
  id: string;
  name: string | LocalizedString;
  description: string | LocalizedString;
  price?: Price;
  primaryImage?: Media;
  images?: Media[];
  taxType?: TaxType;
}
