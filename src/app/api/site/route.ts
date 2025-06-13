import { NextResponse } from 'next/server';
import { PaymentService } from '@/platform/services/payment/PaymentService';
import { SiteService } from '@/platform/services/site/SiteService';

/**
 * GET /api/site
 * Get site data (countries, regions, currencies)
 */
export async function GET() {
  try {
    const siteService = EMP.platform.server.get<SiteService>('SiteService');
    const paymentService = EMP.platform.server.get<PaymentService>('PaymentService');
    const [countries, regions, currencies, paymentModes] = await Promise.all([
      siteService.getCountries(true),
      siteService.getRegions(),
      siteService.getCurrencies(),
      paymentService.getPaymentModes(),
    ]);
    return NextResponse.json({ countries, regions, currencies, paymentModes });
  } catch (error) {
    console.error('Error fetching site data:', error);
    return NextResponse.json({ error: 'Failed to fetch site data' }, { status: 500 });
  }
}
