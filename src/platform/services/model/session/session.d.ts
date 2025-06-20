/**
 * Represents a session context attribute in the service layer
 */
export interface SessionAttribute {
  key: string;
  value: any;
}

/**
 * Represents a session context in the service layer
 */
export interface Session {
  id: string;
  currency?: string;
  siteCode?: string;
  language?: string;
  country?: string;
  region?: string;
  attributes?: Record<string, SessionAttribute>;
}
