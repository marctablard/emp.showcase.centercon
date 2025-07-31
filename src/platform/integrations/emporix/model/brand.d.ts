import { EmporixLocalizedString, EmporixMetadata } from './common';

export interface EmporixBrand {
  id: string;
  name: string;
  description?: string;
  localizedName?: EmporixLocalizedString;
  localizedDescription?: EmporixLocalizedString;
  image?: string;
  cloudinaryUrl?: string;
  metadata?: EmporixMetadata;
}
