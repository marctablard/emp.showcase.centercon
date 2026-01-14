import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetail from '@/components/product/product-detail';
import { JsonLd } from '@/components/seo/json-ld';
import { UiBreadcrumb } from '@/components/ui/molecules/ui-breadcrumb';
import { generateBreadcrumbForProduct } from '@/lib/breadcrumb';
import { getProductById } from '@/lib/ssr/products';
import { generateProductJsonLd, generateProductMetadata } from '@/lib/ssr/seo';
import { isProductSsrEnabled } from '@/lib/ssr/ssr-config';
import { ProductFetchOptions } from '@/platform/services/product';

interface ProductPageProps {
  id: string;
  locale: string;
  site: string;
}

// Helper function to parse product ID and create fetch options based on SSR config
function createProductOptions(id: string, site: string): { productId: string; options: ProductFetchOptions } {
  const customerMatch = id.match(/^AUTHENTICATED_(.+)$/);
  const productId = customerMatch ? customerMatch[1] : id;
  const anonymous = !customerMatch;

  const productConfig = isProductSsrEnabled();

  // Build fetch options based on SSR configuration
  const options: ProductFetchOptions = {
    prices:
      typeof productConfig === 'boolean' ? productConfig : (productConfig.prices ?? false) ? { siteCode: site } : false,
    variants: typeof productConfig === 'boolean' ? productConfig : (productConfig.variants ?? false),
    categories: typeof productConfig === 'boolean' ? productConfig : (productConfig.categories ?? false),
    availability: typeof productConfig === 'boolean' ? productConfig : (productConfig.availability ?? false),
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
