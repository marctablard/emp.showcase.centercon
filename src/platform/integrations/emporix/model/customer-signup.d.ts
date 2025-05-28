/**
 * Customer signup data transfer object
 */
export interface CustomerSignupDto {
  /**
   * Customer email address (will be used as account ID)
   */
  email: string;
  
  /**
   * Customer password
   */
  password: string;
  
  /**
   * Customer title (e.g., MR, MS)
   */
  title?: string;
  
  /**
   * Customer first name
   */
  firstName?: string;
  
  /**
   * Customer last name
   */
  lastName?: string;
  
  /**
   * Customer contact phone
   */
  contactPhone?: string;
  
  /**
   * Customer company
   */
  company?: string;
  
  /**
   * Customer preferred language
   */
  preferredLanguage?: string;
  
  /**
   * Customer preferred currency
   */
  preferredCurrency?: string;
  
  /**
   * Customer preferred site
   */
  preferredSite?: string;
  
  /**
   * Customer business model (B2B or B2C)
   */
  businessModel?: 'B2B' | 'B2C';
  
  /**
   * B2B specific information
   */
  b2b?: {
    /**
     * Company registration ID
     */
    companyRegistrationId?: string;
  };
}
