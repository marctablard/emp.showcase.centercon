import CMSPageComponent from '@/components/cms/storyblok/storyblok-cms-page';

export default async function Home({ params }: { params: Promise<{ locale: string; site: string }> }) {
  const { locale, site } = await params;
  console.log('Home:site', site);
  console.log('Home:locale', locale);
  return <CMSPageComponent slug="home" locale={locale} site={site} emptyOnNoResult={true} />;
}
