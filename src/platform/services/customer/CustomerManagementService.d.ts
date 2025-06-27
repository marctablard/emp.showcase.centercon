import {
  AddressCreateDto,
  AddressUpdateDto,
  CustomerUpdateDto,
  PasswordChangeDto,
  PasswordResetRequestDto,
  PasswordUpdate,
} from '@/platform/integrations/emporix/customer/CustomerManagementApi.d';
import { Address } from '../model/common';
import { Customer } from '../model/customer/customer';

/**
 * Service for managing customer-related operations
 */
export interface CustomerManagementService {
  /**
   * Get the current logged-in customer's profile
   * @returns Promise with the current customer or null if not logged in
   */
  getCompanyOnboardingStatus(legalEntityId: string): Promise<CompanyOnboardingStatus | null>;
}

export interface CompanyOnboardingStatus {
  legalEntityId: string;
  status: 'approved' | 'pending' | 'rejected';
  updatedAt: Date;
}
