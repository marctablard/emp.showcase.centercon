import { CMSNoResult, CMSPage } from '../model/cms';

/**
 * Service for CMS-related operations
 */
export interface CMSService {
  /**
   * Get a page from CMS
   * @param slug The page slug
   * @param locale The locale
   * @param site The site
   * @returns Promise with the page or CMSNoResult if not found
   */
  getPage(slug: string, locale: string, site: string): Promise<CMSPage | CMSNoResult>;
}
