import type { Metadata } from "./common";

export interface EmporixSessionContext {
  sessionId: string;
  customerId?: string;
  siteCode?: string;
  currency?: string;
  cartId?: string;
  targetLocation?: string;
  context?: Record<string, any>;
  metadata?: Metadata;
}


export interface EmporixContextAttribute {
  key: string;
  value: string | Record<string, any>;
}
