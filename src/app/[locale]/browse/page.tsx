import { SearchResultsComponent } from '@/components/search/search-results';
import { searchProducts } from '@/lib/ssr/search';
import { SearchParams } from '@/platform/services/model/common';
import { Product } from '@/platform/services/model/product';

export default async function BrowsePage({ params, searchParams }: { params: Promise<{ locale: string }>, searchParams: Promise<{ q?: string, page?: string, size?: string }> }) {
  const { locale } = await params;
  const { q, page, size } = await searchParams;
  const initialSearch : SearchParams<Product> = {
    page: page ? parseInt(page, 10) : 0,
    size: size ? parseInt(size, 10) : 12,
    query: q
  }
  // Fetch initial products server-side
  const initialResults = await searchProducts(initialSearch);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Product Search</h1>
      
      {/* Client-side search wrapper */}
      <SearchResultsComponent initialSearch={initialSearch} initialResults={initialResults} locale={locale}>

      </SearchResultsComponent>
    </div>
  );
}