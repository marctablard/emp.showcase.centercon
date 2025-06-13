/**
 * Models for Emporix Country API
 */

export interface EmporixCountry {
  code: string;
  name: string | Record<string, string>;
  active: boolean;
  regions?: string[];
  metadata?: {
    createdAt: string;
    modifiedAt: string;
    version: number;
  };
}

export interface EmporixRegion {
  code: string;
  name: string | Record<string, string>;
  metadata?: {
    createdAt: string;
    modifiedAt: string;
    version: number;
  };
}
