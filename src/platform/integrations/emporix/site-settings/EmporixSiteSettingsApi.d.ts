import { EmporixSite } from '../model/site-settings';

/**
 * Interface for site settings API operations
 */
export interface EmporixSiteSettingsApi {
  /**
   * Retrieve a list of site configurations
   * @param includeInactive - Whether to include inactive sites
   */
  getSites(searchParams: SearchParams<EmporixSite>, includeInactive?: boolean): Promise<PaginatedResponse<EmporixSite>>;

  /**
   * Retrieve a specific site configuration by site code
   * @param siteCode - The site code
   */
  getSite(siteCode: string): Promise<EmporixSite | null>;

  /**
   * Retrieve a list of site codes
   * @param includeInactive - Whether to include inactive sites
   */
  getSiteCodes(includeInactive?: boolean): Promise<string[]>;
}
