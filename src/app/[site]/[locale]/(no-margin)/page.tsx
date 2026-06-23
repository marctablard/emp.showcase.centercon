import { setRequestLocale } from 'next-intl/server';
// Temporarily disabled: "Shop by Category" grid on the homepage.
// import CategoryGrid from '@/components/cms/category-grid';
import CMSPageComponent from '@/components/cms/storyblok/storyblok-cms-page';
import { setRequestSite } from '@/site/server/';

export default async function Home({ params }: { params: Promise<{ locale: string; site: string }> }) {
  const { locale, site } = await params;
  setRequestSite(site);
  setRequestLocale(locale);
  return (
    <>
      <CMSPageComponent slug="home" locale={locale} site={site} emptyOnNoResult={true} />
      {/* Temporarily disabled: "Shop by Category" grid.
      <CategoryGrid
        title="Shop by Category"
        subtitle="Discover our wide range of premium products"
        columns={4}
        categoryId="productroot"
      /> */}
    </>
  );
}
