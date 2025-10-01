import { NextRequest, NextResponse } from 'next/server';
import server from '@/platform/server';
import { PriceService } from '@/platform/services/price/PriceService';
import { QuoteService } from '@/platform/services/quote/QuoteService';

/**
 * POST /api/quote
 * Creates a quote from the current cart and provided checkout data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const quoteService = server.get<QuoteService>('QuoteService');
    const priceService = server.get<PriceService>('PriceService');

    const items = Array.isArray(body?.items) ? body.items : undefined;

    if (items && items.length > 0) {
      const defaultUnitCode = process.env.NEXT_PUBLIC_EMPORIX_DEFAULT_UNIT_CODE || 'piece';

      body.items = await Promise.all(
        items.map(async (item: any) => {
          const productId: string | undefined = item?.product?.productId;
          const quantity: number | undefined = item?.quantity?.quantity ?? item?.quantity;
          const unitCode: string = item?.quantity?.unitCode || defaultUnitCode;
          if (!productId || !quantity) return item;

          // Fetch matched price for the product to satisfy required fields
          const matched = await priceService.getProductPrice(productId, quantity);
          if (!matched) return { ...item, quantity: { quantity, unitCode } };

          const unitPrice = matched.amount;
          const taxClass = matched.tax?.taxCode ?? 'STANDARD';
          const taxRate = matched.tax?.taxRate ?? 0;
          const totalNetValue = matched.amount;

          return {
            ...item,
            quantity: { quantity, unitCode: matched.quantity.unitCode },
            price: {
              priceId: matched.id,
              unitPrice,
              totalNetValue,
              tax: { taxClass, taxRate },
            },
          };
        }),
      );
    }

    const result = await quoteService.createQuote(body);

    if (body.shipping && result.quoteId) {
      try {
        await quoteService.updateQuote(
          result.quoteId,
          'replace',
          '/mixins/additionalInfo',
          { reference: body.reference },
          'service',
        );
        await quoteService.updateQuote(result.quoteId, 'replace', '/shipping', body.shipping, 'service');
      } catch (updateError) {
        console.error('Failed to update quote :', updateError);
      }
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating quote:', error);
    const message = error instanceof Error ? error.message : 'Failed to create quote';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
