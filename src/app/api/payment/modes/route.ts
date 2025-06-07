import { NextRequest, NextResponse } from 'next/server';
import type { PaymentGatewayApi } from '@/platform/integrations/emporix/payment/PaymentGatewayApi';

/**
 * GET handler for retrieving all payment modes
 */
export async function GET(_request: NextRequest) {
  try {
    const paymentGatewayService = globalThis.EMP.platform.server.get<PaymentGatewayApi>('EmporixPaymentGatewayApi');
    const paymentModes = await paymentGatewayService.getPaymentModes();
    
    return NextResponse.json(paymentModes);
  } catch (error) {
    console.error('Error fetching payment modes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment modes' },
      { status: 500 }
    );
  }
}
