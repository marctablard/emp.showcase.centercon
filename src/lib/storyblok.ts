import { apiPlugin, storyblokInit } from '@storyblok/react/rsc';
import Feature from '@/components/cms/feature';
import Teaser from '@/components/cms/teaser';
import Grid from '@/components/cms/grid';
import Columns from '@/components/cms/columns';
import Page from '@/components/cms/page';
import Logo from '@/components/cms/logo';
import Navigation from '@/components/cms/navigation';
import ContentBlock from '@/components/cms/content-block';
import Category from '@/components/cms/category';
import Segment from '@/components/cms/segment';
import Article from '@/components/cms/article';

/**
 * Initialize Storyblok client with the access token from environment variables
 * This client can be used to fetch content from Storyblok
 * Using RSC (React Server Components) approach
 */
export const getStoryblokApi = storyblokInit({
  accessToken: process.env.NEXT_PUBLIC_STORYBLOK_ACCESS_TOKEN || '',
  use: [apiPlugin],
  components: {
    feature: Feature,
    teaser: Teaser,
    grid: Grid,
    columns: Columns,
    page: Page,
    logo: Logo,
    navigation: Navigation,
    content_block: ContentBlock,
    category: Category,
    segment: Segment,
    article: Article,
  },
});
