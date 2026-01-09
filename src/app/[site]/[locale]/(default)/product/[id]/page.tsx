import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetail from '@/components/product/product-detail';
import { JsonLd } from '@/components/seo/json-ld';
import { UiBreadcrumb } from '@/components/ui/molecules/ui-breadcrumb';
import { generateBreadcrumbForProduct } from '@/lib/breadcrumb';
import { getAvailability, getProductById } from '@/lib/ssr/products';
import { generateProductJsonLd, generateProductMetadata } from '@/lib/ssr/seo';
import { ProductFetchOptions } from '@/platform/services/product';

interface ProductPageProps {
  id: string;
  locale: string;
  site: string;
}

const PRODUCT_FETCH_OPTIONS: ProductFetchOptions = {
  prices: true,
  variants: true,
  categories: true,
  customerSegments: true,
};

// Helper function to parse product ID and create fetch options
function createProductOptions(id: string, site: string): { productId: string; options: ProductFetchOptions } {
  const customerMatch = id.match(/^AUTHENTICATED_(.+)$/);
  const productId = customerMatch ? customerMatch[1] : id;
  const anonymous = !customerMatch;

  const options: ProductFetchOptions = {
    ...PRODUCT_FETCH_OPTIONS,
    prices: { siteCode: site },
    customerSegments: !anonymous,
  };

  return { productId, options };
}

// Generate metadata for the product page
export async function generateMetadata(
  { params }: { params: Promise<ProductPageProps> },
  _parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id, locale, site } = await params;
  const { productId, options } = createProductOptions(id, site);

  // Fetch product data
  const product = await getProductById(productId, options);

  // If product not found, return basic metadata
  if (!product) {
    return {};
  }

  // Use the extracted SEO utility function to generate metadata
  return generateProductMetadata(locale, product, product.price);
}

export default async function ProductPage({ params }: { params: Promise<ProductPageProps> }) {
  const { id, locale, site } = await params;
  const { productId, options } = createProductOptions(id, site);

  // Fetch product data
  const product = await getProductById(productId, options);

  // If product not found, show 404 page
  if (!product) {
    notFound();
  }
  const jsonLd = await generateProductJsonLd(product, locale);
  const breadcrumbs = generateBreadcrumbForProduct(product, locale);
  return (
    <>
      <JsonLd jsonLd={jsonLd} />
      <div>
        <UiBreadcrumb
          items={breadcrumbs}
          className="max-w-6xl mx-auto px-4 lg:px-9 sm:gap-x-6"
          disabledCategories={true}
        />
        <ProductDetail
          className="max-w-6xl mx-auto px-4 lg:px-9 sm:gap-x-6 lg:pr-38"
          product={product}
          options={options}
        />
      </div>
    </>
  );
}
