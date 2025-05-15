import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

interface Product {
  id: string;
  name: string;
  description?: string;
  images?: string[];
}

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
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
        {/* Product Image */}
        <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <div className="relative h-96 w-full">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover object-center"
              />
            </div>
          ) : (
            <div className="bg-gray-200 h-96 flex items-center justify-center">
              <span className="text-gray-500">{t('noImage')}</span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{product.name}</h1>
          
          {/* Price information removed as requested */}

          <div className="mt-6">
            <h3 className="sr-only">Description</h3>
            <div className="text-base text-gray-700 space-y-6">
              {product.description ? (
                <p>{product.description}</p>
              ) : (
                <p>{t('noDescription')}</p>
              )}
            </div>
          </div>

          <div className="mt-8">
            <button
              type="button"
              className="w-full bg-blue-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t('addToCart')}
            </button>
          </div>

          <div className="mt-6">
            <div className="text-sm text-gray-500">
              <p>{t('productId')}: {product.id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
