import CMSPageComponent from '@/components/cms/storyblok/storyblok-cms-page';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <>
      <CMSPageComponent slug="home" locale={locale} emptyOnNoResult={true} />
    </>
  );
}
