import { inject } from 'inversify';
import { injectable } from '@/platform/core/di/injectable';
import type { CustomerManagementApi } from '@/platform/integrations/emporix/customer/CustomerManagementApi';
import type { CompanyOnboardingStatus, CustomerManagementService } from '../CustomerManagementService';

@injectable('CustomerManagementService', 'Singleton')
export class EmporixCustomerManagementService implements CustomerManagementService {
  constructor(@inject('EmporixCustomerManagementApi') private customerManagementApi: CustomerManagementApi) {}
  async getCompanyOnboardingStatus(legalEntityId: string): Promise<CompanyOnboardingStatus | null> {
    if (!legalEntityId) {
      throw new Error('Not implemented');
    }
    try {
      const response = await this.customerManagementApi.getLegalEntityById(legalEntityId);
      if (!response) {
        return null;
      }
      return {
        legalEntityId: response.id,
        status: this.mapStatus(response.mixins['creditscore']?.internalrating),
        updatedAt: response.mixins['credit-score']?.statusupdate || new Date(),
      };
    } catch (error) {
      console.error('Error fetching onboarding status:', error);
      return null;
    }
  }
  mapStatus(internalrating: any): 'approved' | 'pending' | 'rejected' {
    if (internalrating === 'approved' || internalrating === 'auto-approved' || internalrating === 'whitelisted') {
      return 'approved';
    } else if (internalrating === 'blacklisted') {
      return 'rejected';
    } else {
      return 'pending';
    }
  }
}

export default EmporixCustomerManagementService;
