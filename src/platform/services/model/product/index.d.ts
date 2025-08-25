import { EmporixMixin } from '@/platform/integrations/emporix/model';
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

export interface ProductSpecification {
  key: string;
  group?: string;
  groupLabel?: LocalizedString;
  label: LocalizedString;
  value: LocalizedString;
  unit?: LocalizedString;
}

export interface GroupedSpecification {
  groupName: string | LocalizedString;
  item: Array<{
    label: string | LocalizedString;
    value: string | LocalizedString;
    unit: string | LocalizedString;
  }>;
}

export interface ProductDocument {
  title: LocalizedString;
  description: LocalizedString;
  url: string;
  mime: string;
  group: string;
  groupLabel: LocalizedString;
}

export interface ProductUSP {
  icon: string;
  description: LocalizedString;
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
  usp?: string | LocalizedString;
  highlights?: { [locale: string]: string[] };
  documents?: Media[];
  // Additional fields from mixins
  specifications?: ProductSpecification[];
  groupedSpecifications?: GroupedSpecification[];
  usps?: ProductUSP[];
  templateAttributes?: Record<string, string>;
  variantAttributes?: Record<string, string>;
}

export interface ProductRecommendations {
  products: Product[];
}
