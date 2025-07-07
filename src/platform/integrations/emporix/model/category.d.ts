import { EmporixLocalizedString, EmporixMedia, EmporixMetadata, EmporixMixins } from './common';

export interface EmporixCategory {
  id: string;
  code?: string;
  name: EmporixLocalizedString;
  description?: EmporixLocalizedString;
  shortDescription?: EmporixLocalizedString;
  slug?: EmporixLocalizedString;
  published?: boolean;
  visible?: boolean;
  position?: number;
  parentId?: string;
  supercategoriesIds?: string[];
  media?: EmporixMedia[];
  metadata?: EmporixMetadata;
  mixins?: EmporixMixins;
  customAttributes?: {
    [key: string]: any;
  };
}

export interface EmporixCategoryParent extends EmporixCategory {
  level?: number;
}
