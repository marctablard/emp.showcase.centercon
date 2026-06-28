import { Company, CompanyDetails, CompanyUpdateDto } from '../model/company/company';
import { CustomerAddress } from '../model/customer/customer';
import { CompanyGroup, CreateTeamMemberInput, TeamMember } from '../model/team/team';

/**
 * Service for company-related operations
 */
export interface CompanyService {
  /**
   * Get the Company
   * @param companyId The ID of the company to retrieve (or none for the current)
   * @returns Promise with the current company or null if not logged in
   */
  getCompany(companyId?: string): Promise<Company | null>;

  /**
   * Get all companies assigned to the current user
   * @returns Promise with array of companies
   */
  getCompanies(): Promise<Company[]>;

  /**
   * Addresses derived from the current session legal entity locations (Customer Management).
   * Used for B2B checkout address book; not persisted customer profile addresses.
   */
  getLegalEntityCheckoutAddresses(): Promise<CustomerAddress[]>;

  /**
   * Get the full, editable details of the currently selected company (legal entity),
   * including legal info, account limit, type/parent and locations.
   * @param companyId Optional legal entity id (defaults to the currently selected one).
   */
  getCompanyDetails(companyId?: string): Promise<CompanyDetails | null>;

  /**
   * Update the currently selected company (legal entity).
   * @param update Fields to update.
   * @param companyId Optional legal entity id (defaults to the currently selected one).
   */
  updateCompany(update: CompanyUpdateDto, companyId?: string): Promise<CompanyDetails>;

  /**
   * Get the predefined customer groups (Admin / Buyer / Requester / Contact)
   * of the currently selected company.
   */
  getCompanyGroups(companyId?: string): Promise<CompanyGroup[]>;

  /**
   * Get the members (customers) of the currently selected company together with
   * their company group roles.
   */
  getTeamMembers(companyId?: string): Promise<TeamMember[]>;

  /**
   * Create (invite) a new team member for the currently selected company and
   * assign them to the requested company groups. The Contact group is always
   * added automatically; at most one managed role group is allowed.
   */
  createTeamMember(input: CreateTeamMemberInput, companyId?: string): Promise<TeamMember>;

  /**
   * Set a member's company group memberships to the given set, respecting the
   * rules: the Contact group is always kept, at most one managed role group
   * (Admin / Buyer / Requester) is allowed, and any number of custom groups.
   */
  updateTeamMemberGroups(customerId: string, groupIds: string[], companyId?: string): Promise<TeamMember>;

  /**
   * Remove a member from the currently selected company (removes their group
   * assignments and contact assignment; does not delete the customer account).
   */
  removeTeamMember(customerId: string, companyId?: string): Promise<void>;
}
