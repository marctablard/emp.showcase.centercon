'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { ISbStoriesParams, StoryblokClient } from '@storyblok/react/rsc';
import { ArrowUpRight } from 'lucide-react';
import UiLink from '@/components/ui/link';
import { getStoryblokApi } from '@/lib/storyblok';

interface TopBannerAnnouncementContent {
  title: string;
  link: {
    id: string;
    url: string;
    target: string;
  };
  is_active: boolean;
}

async function fetchData(locale: string) {
  const sbParams: ISbStoriesParams = {
    version: process.env.NEXT_PUBLIC_STORYBLOK_ACCESS_PREVIEW === 'true' ? 'draft' : 'published',
    language: locale,
  };

  const storyblokApi: StoryblokClient = getStoryblokApi();
  return storyblokApi.get('cdn/stories/top-banner-announcement', sbParams);
}

export default function TopBannerAnnouncement() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const locale = useLocale();

  useEffect(() => {
    let isMounted = true;

    const getData = async () => {
      try {
        setIsLoading(true);
        const response = await fetchData(locale);

        if (isMounted) {
          setData(response.data);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching banner data:', err);
          setIsLoading(false);
        }
      }
    };

    getData();

    return () => {
      isMounted = false;
    };
  }, [locale]);

  if (isLoading || !data || !data?.story?.content?.is_active) return null;
  const content: TopBannerAnnouncementContent = data?.story?.content;

  return (
    <UiLink
      type="Link"
      href={content.link.url}
      target={content.link.target}
      className="text-white hover:text-white"
      iconAfter={<ArrowUpRight className="w-4 h-4" />}
    >
      {content.title}
    </UiLink>
  );
}
