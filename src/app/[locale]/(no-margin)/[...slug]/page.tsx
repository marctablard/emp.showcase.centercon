import CMSPageComponent from '@/components/cms/cms-page';
import { UiBreadcrumb } from '@/components/ui/molecules/ui-breadcrumb';
import { BreadcrumbContent } from '@/lib/breadcrumb';

interface DynamicPageParams {
  slug: string[];
  locale: string;
}

export default async function DynamicPage({ params }: { params: Promise<DynamicPageParams> }) {
  const { slug, locale } = await params;

  return (
    <div>
      <CMSPageComponent slug={slug.join('/')} locale={locale} />
    </div>
  );
}
