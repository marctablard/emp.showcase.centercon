export interface Category {
  id: string;
  code?: string;
  name: LocalizedString;
  description?: LocalizedString;
  shortDescription?: LocalizedString;
  slug?: LocalizedString;
  published?: boolean;
  visible?: boolean;
  position?: number;
  parent?: Category | string | null; // either the Category itself, or just the id
  children?: Category[] | string[]; // see above
  media?: Media[];
  metadata?: Metadata;
  mixins?: Mixins;
  customAttributes?: {
    [key: string]: any;
  };
}
