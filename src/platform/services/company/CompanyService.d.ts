/**
 * Service for company-related operations
 */
export interface CompanyService {
  /**
   * Get the Company
   * @param companyId The ID of the company to retrieve (or none for the current)
   * @returns Promise with the current company or null if not logged in
   */
  getCompany(companyId?: string): Promise<Customer | null>;
}
