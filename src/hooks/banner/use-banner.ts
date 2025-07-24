import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { ISbStoriesParams, StoryblokClient } from '@storyblok/react/rsc';
import { getStoryblokApi } from '@/lib/storyblok';
import { useBannerStore } from './banner-store';

interface TopBannerAnnouncementContent {
  title: string;
  link: {
    id: string;
    url: string;
    target: string;
  };
  is_active: boolean;
}

interface BannerData {
  story?: {
    content: TopBannerAnnouncementContent;
  };
}

interface UseBannerResult {
  data: BannerData | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook for fetching and managing banner data
 * Uses the BannerStore to share data between components
 */
export function useBanner(): UseBannerResult {
  const locale = useLocale();
  const { data, setData, error, setError } = useBannerStore();
  const [isLoading, setIsLoading] = useState<boolean>(!data);

  useEffect(() => {
    let isMounted = true;

    const fetchBannerData = async () => {
      // If data already exists in the store, don't fetch again
      if (data) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        const sbParams: ISbStoriesParams = {
          version: process.env.NEXT_PUBLIC_STORYBLOK_ACCESS_PREVIEW === 'true' ? 'draft' : 'published',
          language: locale,
        };

        const storyblokApi: StoryblokClient = getStoryblokApi();
        const response = await storyblokApi.get('cdn/stories/top-banner-announcement', sbParams);

        if (isMounted) {
          setData(response.data);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching banner data:', err);
          setError(err instanceof Error ? err : new Error('Unknown error'));
          setIsLoading(false);
        }
      }
    };

    fetchBannerData();

    return () => {
      isMounted = false;
    };
  }, [locale, data, setData, setError]);

  return { data, isLoading, error };
}

export default useBanner;
