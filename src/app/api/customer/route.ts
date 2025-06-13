import { NextRequest, NextResponse } from 'next/server';
import type { CustomerService } from '@/platform/services/customer/CustomerService';

/**
 * GET /api/customer
 * Get the current customer information
 */
export async function GET(_request: NextRequest) {
  try {
    const customerService = globalThis.EMP.platform.server.get<CustomerService>('CustomerService');
    const customer = await customerService.getCurrentCustomer();

    if (!customer) {
      // Return 204 No Content if no customer is logged in
      return new NextResponse(null, { status: 204 });
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json({ error: 'Failed to fetch customer information' }, { status: 500 });
  }
}
