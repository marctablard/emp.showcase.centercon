import { ISbStoriesParams, StoryblokClient } from '@storyblok/react/rsc';
import { ISbResult } from '@storyblok/react/rsc';
import { getStoryblokApi } from '@/lib/storyblok';

/**
 * Fetch data from Storyblok
 */
export async function fetchStoryblokData(slug: string = 'home') : Promise<{ data: ISbResult }> {
  let sbParams: ISbStoriesParams = { 
    version: process.env.NODE_ENV === 'production' ? 'published' : 'draft'
  };

  const storyblokApi: StoryblokClient = getStoryblokApi();
  return await storyblokApi.get(`cdn/stories/${slug}`, sbParams);
}
