import { StoryblokStory, ISbStoriesParams, StoryblokClient } from '@storyblok/react/rsc';
import { getStoryblokApi } from '@/lib/storyblok';
import { notFound } from 'next/navigation';

interface CMSPageParams {
    slug: string;
    locale: string;
}

/**
 * Fetch data from Storyblok
 */
async function fetchData(locale: string, slug: string) {
  let sbParams: ISbStoriesParams = { 
    version: process.env.NODE_ENV === 'production' ? 'published' : 'draft',
    language: locale,
  };

  const storyblokApi: StoryblokClient = getStoryblokApi();
  return storyblokApi.getStory(slug, sbParams);
}

/**
 * Storyblok Demo Page
 * Fetches and displays content from Storyblok using server components
 */
export default async function CMSPageComponent({ slug, locale }: CMSPageParams) {
  const { data } = await fetchData(locale, slug);
  
  if (!data?.story) {
    notFound();
  }

  return (
    <div>
      <StoryblokStory story={data.story} />
    </div>
  );
}

