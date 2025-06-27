import { notFound } from 'next/navigation';
import { ISbStoriesParams, StoryblokClient, StoryblokStory } from '@storyblok/react/rsc';
import { sub } from 'date-fns';
import { BreadcrumbContent } from '@/lib/breadcrumb';
import { getStoryblokApi } from '@/lib/storyblok';
import { UiBreadcrumb } from '../ui/molecules/ui-breadcrumb';

interface CMSPageParams {
  slug: string;
  locale: string;
}

/**
 * Fetch data from Storyblok
 */
async function fetchData(locale: string, slug: string) {
  const sbParams: ISbStoriesParams = {
    version: process.env.NEXT_PUBLIC_STORYBLOK_ACCESS_PREVIEW === 'true' ? 'draft' : 'published',
    language: locale,
  };

  const storyblokApi: StoryblokClient = getStoryblokApi();
  return storyblokApi.getStory(slug, sbParams);
}

const buildBreadcrumb = async (slug: string, locale: string): Promise<BreadcrumbContent[]> => {
  let subSlug = slug;
  const result: BreadcrumbContent[] = [];
  while (subSlug.length > 0) {
    const subData = await fetchData(locale, subSlug);
    if (subData.data?.story) {
      result.push({
        href: `/${subSlug}`,
        label: subData.data.story.name,
      });
    }
    const ix = subSlug.lastIndexOf('/');
    if (ix === -1) {
      break;
    }
    subSlug = subSlug.substring(ix);
  }
  return result;
};

/**
 * Storyblok Demo Page
 * Fetches and displays content from Storyblok using server components
 */
export default async function CMSPageComponent({ slug, locale }: CMSPageParams) {
  const { data } = await fetchData(locale, slug);

  if (!data?.story) {
    notFound();
  }
  let breadcrumb: BreadcrumbContent[] = [];
  if (!data.story.content.no_margin) {
    breadcrumb = await buildBreadcrumb(slug, locale);
  }

  return (
    <>
      <div className={data.story.content.no_margin ? '' : 'flex-grow mt-17 md:mt-36 lg:mt-52'}>
        {breadcrumb.length > 0 && (
          <UiBreadcrumb items={breadcrumb} className="max-w-6xl mx-auto px-4 lg:px-9 md:gap-x-6" />
        )}
        <StoryblokStory story={data.story} />
      </div>
    </>
  );
}
