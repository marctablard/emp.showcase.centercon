import { NextRequest, NextResponse } from 'next/server';
import { CustomerService } from '@/platform/services/customer/CustomerService';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: customerId } = await params;

    const customerService = globalThis.EMP.platform.server.get<CustomerService>('CustomerService');
    const addresses = await customerService.getAddresses(customerId === 'current' ? undefined : customerId);

    return NextResponse.json(addresses);
  } catch (error) {
    console.error('Error fetching customer addresses:', error);
    return NextResponse.json({ error: 'Failed to fetch customer addresses' }, { status: 500 });
  }
}
