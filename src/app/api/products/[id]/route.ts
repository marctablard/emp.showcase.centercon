import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/platform/services/product/ProductService';

/**
 * API endpoint to get a specific product by ID
 * GET /api/products/[id]
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: productId } = await params;

    const productService = EMP.platform.server.get<ProductService>('ProductService');
    const product = await productService.getProductById(productId);

    if (!product) {
      return NextResponse.json({ error: `Product with ID ${productId} not found` }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
