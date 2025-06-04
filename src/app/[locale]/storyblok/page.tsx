import { ISbStoriesParams, StoryblokClient, StoryblokStory } from '@storyblok/react/rsc';
import { User } from 'lucide-react';
import { Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
      <h1 className="text-3xl font-bold mb-6">Storyblok Demo</h1>

      {/* If a story was found, display the content */}
      {data?.story ? (
        <div>
          <StoryblokStory story={data.story} />
        </div>
      ) : (
        <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
          <p>No content found. Please make sure that:</p>
          <ul className="list-disc ml-6 mt-2">
            <li>You have a valid Storyblok Access Token in your .env file</li>
            <li>You have created a &quot;home&quot; story in your Storyblok Space</li>
            <li>The story is published (or in draft mode if you&apos;re in development environment)</li>
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-6">
          <h4>Label</h4>
          <div className="flex gap-10">
            <div className="flex flex-col gap-2">
              <Label>Label</Label>
            </div>
            <div className="flex flex-col gap-2">
              <Label isOptional>Label</Label>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h4>Field</h4>
          <div className="flex gap-10">
            <div className="flex flex-col gap-2">
              <h5>Default</h5>
              <Input startIcon={User} endIcon={Eye} />
            </div>
            <div className="flex flex-col gap-2">
              <h5>Error</h5>
              <Input startIcon={User} endIcon={Eye} hasError />
            </div>
            <div className="flex flex-col gap-2">
              <h5>Success</h5>
              <Input startIcon={User} endIcon={Eye} />
            </div>
            <div className="flex flex-col gap-2">
              <h5>Disabled</h5>
              <Input startIcon={User} endIcon={Eye} isDisabled disabled />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
