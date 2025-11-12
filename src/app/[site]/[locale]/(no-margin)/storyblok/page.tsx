import { ISbStoriesParams, StoryblokClient, StoryblokStory } from '@storyblok/react/rsc';
import { H1 } from '@/components/ui/h';
import { getStoryblokApi } from '@/lib/storyblok';

/**
 * Fetch data from Storyblok
 */
async function fetchData() {
  const sbParams: ISbStoriesParams = {
    version: process.env.NODE_ENV === 'production' ? 'published' : 'draft',
  };

  const storyblokApi: StoryblokClient = getStoryblokApi();
  return storyblokApi.get('cdn/stories/home', sbParams);
}

/**
 * Storyblok Demo Page
 * Fetches and displays content from Storyblok using server components
 */
export default async function StoryblokPage() {
  const { data } = await fetchData();

  return (
    <div className="container mx-auto py-8">
      <H1 variant="h5" className="mb-6">
        Storyblok Demo
      </H1>

      {/* If a story was found, display the content */}
      {data?.story ? (
        <div>
          <StoryblokStory story={data.story} />
        </div>
      ) : (
        <div className="p-4 bg-surface-warning border border-border-warning rounded">
          <p>No content found. Please make sure that:</p>
          <ul className="list-disc ml-6 mt-2">
            <li>You have a valid Storyblok Access Token in your .env file</li>
            <li>You have created a &quot;home&quot; story in your Storyblok Space</li>
            <li>The story is published (or in draft mode if you&apos;re in development environment)</li>
          </ul>
        </div>
      )}
    </div>
  );
}
