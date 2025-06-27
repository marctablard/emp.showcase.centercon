import { EmporixLocalizedString, Media, Metadata, Mixins } from './common';
import { EmporixMatchedPrice as EmporixPrice } from './price';

export interface EmporixLabelOverlay {
  isTrue?: boolean;
  position: number;
}

export interface EmporixLabel {
  id: string;
  name: string;
  image?: string;
  cloudinaryUrl?: string;
  overlay?: EmporixLabelOverlay;
  description: string | EmporixLocalizedString;
  metadata?: Metadata;
}

export interface Product {
  id?: string;
  yrn?: string;
  code: string;
  name: string | EmporixLocalizedString;
  description?: string | EmporixLocalizedString;
  media?: Media[];
  productType?: string;
  brandId?: string;
  labelIds?: string[];
  taxClasses?: {
    [key: string]: string;
  };
  mixins?: Mixins;
  published?: boolean;
  metadata?: Metadata;
  prices?: EmporixPrice[];
}
