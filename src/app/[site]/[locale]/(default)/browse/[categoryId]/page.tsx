import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { CategoryProductGrid } from '@/components/category/category-product-grid';
import { Heading } from '@/components/ui/h';
import { getCategoryById, getProductsForCategory } from '@/lib/ssr/category';
import { resolveLocalizedName } from '@/lib/ssr/category';
import { getPageTitle } from '@/lib/ssr/seo';

interface CategoryPageParams {
  params: Promise<{ locale: string; categoryId: string }>;
  searchParams: Promise<Record<string, string | string[]>>;
}

function resolveCategoryName(name: any, locale: string): string {
  if (!name) return '';
  if (typeof name === 'string') return name;
  return resolveLocalizedName(name, locale);
}

export async function generateMetadata({ params }: CategoryPageParams): Promise<Metadata> {
  const { locale, categoryId } = await params;
  const category = await getCategoryById(categoryId);
  const categoryName = category ? resolveCategoryName(category.name, locale) : categoryId;

  return {
    title: await getPageTitle(categoryName, locale),
    description: `Browse products in ${categoryName}`,
    robots: { index: true, follow: true },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageParams) {
  const { locale, categoryId } = await params;
  const rawParams = await searchParams;

  const page = rawParams.page ? parseInt(rawParams.page as string, 10) : 0;
  const pageSize = 12;

  const [category, { products, total }] = await Promise.all([
    getCategoryById(categoryId),
    getProductsForCategory(categoryId, page, pageSize),
  ]);

  if (!category) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'search.searchResults' });
  const categoryName = resolveCategoryName(category.name, locale);

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-9 pb-32">
      <Heading variant="h2" className="mb-6">
        {categoryName}
      </Heading>

      {total > 0 && (
        <p className="text-sm text-text-subtle mb-6">
          {t('showing', { start: page * pageSize + 1, end: page * pageSize + products.length, total })}
        </p>
      )}

      <CategoryProductGrid products={products} locale={locale} />

      {products.length === 0 && total === 0 && (
        <p className="text-text-subtle py-12 text-center">{t('noProductsFound')}</p>
      )}
    </div>
  );
}
