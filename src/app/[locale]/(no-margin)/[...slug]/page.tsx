import CMSPageComponent from '@/components/cms/cms-page';

interface DynamicPageParams {
  slug: string[];
  locale: string;
}

export default async function DynamicPage({ params }: { params: Promise<DynamicPageParams> }) {
  const { slug, locale } = await params;

  return <CMSPageComponent slug={slug.join('/')} locale={locale} />;
}
