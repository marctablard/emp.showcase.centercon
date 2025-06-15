import { EmporixLocalizedString, Metadata } from './common';

export interface EmporixBrand {
  id: string;
  name: string;
  description?: string;
  localizedName?: EmporixLocalizedString;
  localizedDescription?: EmporixLocalizedString;
  image?: string;
  cloudinaryUrl?: string;
  metadata?: Metadata;
}
