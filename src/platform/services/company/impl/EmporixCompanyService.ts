import { inject } from 'inversify';
import { injectable } from '@/platform/core/di/injectable';
import type { EmporixCustomerManagementApi } from '@/platform/integrations/emporix/customer/EmporixCustomerManagementApi';
import type { CustomerService } from '../../customer/CustomerService';
import { Company } from '../../model/company/company';
import type { CompanyService } from '../CompanyService';

@injectable('CompanyService', 'Singleton')
export class EmporixCompanyService implements CompanyService {
  constructor(
    @inject('EmporixCustomerManagementApi')
    private readonly customerManagementApi: EmporixCustomerManagementApi,
    @inject('CustomerService')
    private readonly customerService: CustomerService,
  ) {}

  async getCompany(companyId?: string): Promise<Company | null> {
    if (!companyId) {
      const customer = await this.customerService.getCustomer();
      if (!customer) {
        return null;
      }
      companyId = customer.legalEntityId;
    }

    if (!companyId) {
      return null;
    }
    const emporixLegalEntity = await this.customerManagementApi.getLegalEntityById(companyId);
    if (!emporixLegalEntity) {
      return null;
    }
    const creditscore = emporixLegalEntity.mixins?.['creditscore'];

    return {
      id: emporixLegalEntity.id,
      name: emporixLegalEntity.name,
      onboarding: {
        status: this.mapStatus(creditscore?.internalrating),
        updatedAt: creditscore?.statusupdate || new Date(),
      },
    };
  }
  mapStatus(internalrating?: string): 'approved' | 'pending' | 'rejected' {
    if (!internalrating) {
      return 'pending';
    }
    switch (internalrating) {
      case 'approved':
      case 'auto-approved':
      case 'whitelisted':
        return 'approved';
      case 'blacklisted':
        return 'rejected';
      default:
        return 'pending';
    }
  }
}
export default EmporixCompanyService;
