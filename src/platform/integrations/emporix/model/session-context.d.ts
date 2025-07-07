import type { EmporixMetadata } from './common';

export interface EmporixSessionContext {
  sessionId: string;
  customerId?: string;
  siteCode?: string;
  currency?: string;
  cartId?: string;
  targetLocation?: string;
  context?: Record<string, any>;
  metadata?: EmporixMetadata;
}

export interface EmporixContextAttribute {
  key: string;
  value: string | Record<string, any>;
}
