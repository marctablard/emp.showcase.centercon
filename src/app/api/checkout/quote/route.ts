import { NextRequest, NextResponse } from 'next/server';
import { checkoutFromQuote } from '@/lib/client/checkout';
import type { QuoteCheckoutRequest } from '@/platform/services/model/checkout';

/**
 * API route for processing a quote checkout
 * POST /api/checkout/quote
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const quoteCheckoutData: QuoteCheckoutRequest = await request.json();

    // Validate required fields
    if (!quoteCheckoutData.quoteId) {
      return NextResponse.json({ error: 'Missing required field: quoteId' }, { status: 400 });
    }

    if (!quoteCheckoutData.paymentMethod) {
      return NextResponse.json({ error: 'Missing required field: paymentMethod' }, { status: 400 });
    }

    // Process the quote checkout
    const response = await checkoutFromQuote(quoteCheckoutData);

    // Return the response
    return NextResponse.json(response);
  } catch (error) {
    console.error('Quote checkout error:', error);

    return NextResponse.json(
      { error: 'Failed to process quote checkout', details: (error as Error).message },
      { status: 500 },
    );
  }
}
