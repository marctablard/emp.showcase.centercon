import { NextRequest, NextResponse } from 'next/server';
import { ShippingService } from '@/platform/services/shipping/ShippingService';

/**
 * GET /api/shipping
 * Get shipping methods for a country and postal code
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ countryCode: string; postalCode: string }> }) {
  try {
    const { countryCode, postalCode } = await params;

    if (!countryCode || !postalCode) {
      return NextResponse.json(
        { error: 'Missing required parameters: countryCode and postalCode' },
        { status: 400 }
      );
    }

    const shippingService = EMP.platform.server.get<ShippingService>('ShippingService');
    
    const methods = await shippingService.getShippingMethods(countryCode, postalCode);
    
    return NextResponse.json(methods);
  } catch (error) {
    console.error('Error fetching shipping methods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shipping methods' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/shipping/[methodId]
 * Get a specific shipping method by ID
 */
export async function POST(_request: NextRequest, { params }: { params: Promise<{ methodId: string; zoneId: string }> }) {
  try {
    const { methodId, zoneId } = await params;

    if (!methodId || !zoneId) {
      return NextResponse.json(
        { error: 'Missing required parameters: methodId and zoneId' },
        { status: 400 }
      );
    }

    const shippingService = EMP.platform.server.get<ShippingService>('ShippingService');
    
    const method = await shippingService.getShippingMethod(methodId, zoneId);
    
    if (!method) {
      return NextResponse.json(
        { error: 'Shipping method not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(method);
  } catch (error) {
    console.error('Error fetching shipping method:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shipping method' },
      { status: 500 }
    );
  }
}
