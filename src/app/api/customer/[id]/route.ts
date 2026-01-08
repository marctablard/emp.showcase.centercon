import { NextRequest, NextResponse } from 'next/server';
import { getServerLogger } from '@/lib/logger/server-logger';
import server from '@/platform/server';
import { CustomerService } from '@/platform/services/customer/CustomerService';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: customerId } = await params;

  try {
    const customerService = server.get<CustomerService>('CustomerService');
    const customer = await customerService.getCustomer(customerId === 'current' ? undefined : customerId);

    if (!customer) {
      // Return 204 No Content if no customer is found
      return new NextResponse(null, { status: 204 });
    }

    return NextResponse.json(customer);
  } catch (error) {
    const logger = getServerLogger();
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        path: `/api/customer/${customerId}`,
        method: 'GET',
        customerId,
      },
      'Error fetching customer',
    );
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 });
  }
}
