import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ProductCarousel } from '@/components/product/product-carousel';
import { ProductPriceComponent } from '@/components/product/product-price';
import { ProductTabsComponent } from '@/components/product/product-tabs';
import { Product } from '@/platform/services/model/product';

const priceTiers = [
  { quantity: 1, price: 110.45 },
  { quantity: 5, price: 95.45 },
  { quantity: 10, price: 85.45 },
  { quantity: 20, price: 82.45 },
  { quantity: 50, price: 79.45 },
];

// This enables Server Side Rendering
async function getProduct(id: string): Promise<Product | null> {
  try {
    // Use server-side fetch for SSR
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/products/${id}`, {
      cache: 'no-store' // Disable caching to always get fresh data
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch product: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string, locale: string }> }) {
  const productId = (await params).id;
  const locale = (await params).locale;
  
  // Get translations for the current locale
  const t = await getTranslations({ locale, namespace: 'product' });
  
  // Fetch product data server-side
  let product: Product | null;
  try {
    product = await getProduct(productId);
  } catch (error) {
    throw new Error(`Error loading product: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  // If product not found, show 404 page
  if (!product) {
    notFound();
  }



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="overflow-hidden border-0 shadow-none mb-8">
        <CardContent className="p-0">
          <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
            {/* Product Image Carousel */}
            <div className="overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <ProductCarousel images={[product.images[0]]} />
              ) : (
            <div className="bg-gray-200 h-96 flex items-center justify-center">
                  <span className="text-gray-500">{t('noImage')}</span>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="p-8">
              <Badge className="mb-2 bg-cyan-500 hover:bg-cyan-600">
                In Stock
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">{product.name}</h1>
              
              <ProductPriceComponent price={110.45} tiers={priceTiers} />

              <div className="mt-6">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Button 
                      variant="outline" 
                      className="h-9 w-9 p-0 flex items-center justify-center rounded-l-md rounded-r-none"
                    >
                      -
                    </Button>
                    <Input 
                      type="text" 
                      value="5" 
                      className="w-12 h-9 text-center rounded-none border-x-0" 
                      readOnly
                    />
                    <Button 
                      variant="outline" 
                      className="h-9 w-9 p-0 flex items-center justify-center rounded-r-md rounded-l-none"
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex space-x-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                >
                  Add to Cart
                </Button>
                <Button 
                  className="flex-1"
                >
                  Buy Now
                </Button>
              </div>

              <div className="mt-6">
                <div className="text-sm text-gray-500">
                  <p>SKU: {product.id }</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Frequently Bought Together - Moved outside the main card */}
      {/*
      <Card className="border-0 shadow-none">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">Frequently bought together</h3>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative h-24 w-24 border rounded-md overflow-hidden">
              <Image 
                src={product.images?.[0] || '/placeholder.jpg'} 
                alt="Single Solar" 
                fill 
                className="object-cover"
              />
            </div>
            <div className="text-xl">+</div>
            <div className="relative h-24 w-36 border rounded-md overflow-hidden">
              <Image 
                src={product.images?.[0] || '/placeholder.jpg'} 
                alt="Twin Solar" 
                fill 
                className="object-cover"
              />
            </div>
            <div className="text-xl">+</div>
            <div className="relative h-24 w-36 border rounded-md overflow-hidden">
              <Image 
                src="/cable.jpg" 
                alt="5m Connector" 
                fill 
                className="object-cover"
              />
            </div>
            <div className="ml-auto">
              <div className="text-right">
                <div className="text-red-500 line-through text-sm">$456.76</div>
                <div className="text-lg font-medium">$345.75</div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-700">
              <span className="font-medium">Single Solar, Twin Solar, 5m Connector</span>
            </div>
          </div>
        </CardContent>
      </Card>
      */}
      {/* Product Tabs */}
      <ProductTabsComponent product={product} />
    </div>
  );
}
