// CMS Component Types
export interface CMSPage {
  title: string;
  description: string;
  url: string;
  components: CMSComponent[];
  no_margin?: boolean;
  template?: string; // Reference to a template
}

export interface CMSNoResult {
  notfound?: boolean;
  message?: string;
}

export interface CMSComponent {
  id: string;
  type: string;
  [key: string]: any;
}
