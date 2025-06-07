import { NextRequest, NextResponse } from 'next/server';
import type { PaymentGatewayApi } from '@/platform/integrations/emporix/payment/PaymentGatewayApi';

/**
 * GET handler for retrieving a specific payment mode by ID
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  if (!id) {
    return NextResponse.json(
      { error: 'Payment mode ID is required' },
      { status: 400 }
    );
  }
  
  try {
    const paymentGatewayService = globalThis.EMP.platform.server.get<PaymentGatewayApi>('EmporixPaymentGatewayApi');
    const paymentMode = await paymentGatewayService.getPaymentMode(id);
    
    if (!paymentMode) {
      return NextResponse.json(
        { error: 'Payment mode not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(paymentMode);
  } catch (error) {
    console.error(`Error fetching payment mode ${id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch payment mode' },
      { status: 500 }
    );
  }
}
