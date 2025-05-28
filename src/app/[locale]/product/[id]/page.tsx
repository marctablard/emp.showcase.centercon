import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProductPriceComponent } from '@/components/product/product-price';
import { ProductTabsComponent } from '@/components/product/product-tabs';
import { getTranslations } from 'next-intl/server';
import { getProductById } from '@/lib/ssr/products';
import { ProductCarousel } from '@/components/product/product-carousel';
import { useL10n } from '@/hooks/useL10n';
import ProductActions from '@/components/product/product-actions';


const priceTiers = [
  { quantity: 1, price: 110.45 },
  { quantity: 5, price: 95.45 },
  { quantity: 10, price: 85.45 },
  { quantity: 20, price: 82.45 },
  { quantity: 50, price: 79.45 },
];

interface ProductPageProps {
  id: string;
  locale: string;
}

export default async function ProductPage({ params }: { params: Promise<ProductPageProps> }) {

  const productId = (await params).id;
  const locale = (await params).locale;
  const { l10n } = useL10n(locale);

  // Get translations for the current locale
  const t = await getTranslations({ locale, namespace: 'product' });
    
  // Fetch product data server-side using our shared API layer
  const product = await getProductById(productId);
  
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
              <ProductCarousel images={product.images} />
              
            </div>
            
            {/* Product Details */}
            <div className="p-8">
              <Badge className="mb-2 bg-cyan-500 hover:bg-cyan-600">
                In Stock
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">{l10n(product.name)}</h1>
              
              <ProductPriceComponent price={110.45} tiers={priceTiers} />

              <div className="mt-6 flex space-x-4">
                <ProductActions product={product} />
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
