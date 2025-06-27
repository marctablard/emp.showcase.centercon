import { NextRequest, NextResponse } from 'next/server';
import { CustomerManagementService } from '@/platform/services/customer/CustomerManagementService';
import type { CustomerService } from '@/platform/services/customer/CustomerService';

/**
 * GET /api/customer/current/onboarding
 * This route is used to check if the current customer has completed onboarding.
 */
export async function GET(_request: NextRequest) {
  try {
    const customerService = globalThis.EMP.platform.server.get<CustomerService>('CustomerService');
    const customer = await customerService.getCustomer();

    if (!customer || !customer.legalEntityId || customer.businessModel !== 'B2B') {
      return NextResponse.json({}, { status: 200 });
    }

    const customerManagementService =
      globalThis.EMP.platform.server.get<CustomerManagementService>('CustomerManagementService');
    const onboardingStatus = await customerManagementService.getCompanyOnboardingStatus(customer.legalEntityId);
    if (onboardingStatus?.status === 'approved') {
      if (onboardingStatus?.updatedAt && customer.lastLogin && onboardingStatus.updatedAt > customer.lastLogin) {
        return NextResponse.json(onboardingStatus, { status: 200 });
      }
    } else {
      return NextResponse.json(onboardingStatus, { status: 200 });
    }
  } catch (error) {
    console.error('Error fetching onboarding status:', error);
    return NextResponse.json({}, { status: 200 });
  }

  return NextResponse.json({}, { status: 200 });
}
