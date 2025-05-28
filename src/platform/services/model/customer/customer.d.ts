/**
 * Customer domain model
 * Basic customer information
 */
export interface Customer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  contactPhone?: string;
  language?: string;
  currency?: string;
}
