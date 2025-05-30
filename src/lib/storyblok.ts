import { apiPlugin, storyblokInit } from '@storyblok/react/rsc';
import Feature from '@/components/storyblok/Feature';
import Teaser from '@/components/storyblok/Teaser';
import Grid from '@/components/storyblok/Grid';
import Columns from '@/components/storyblok/Columns';
import Page from '@/components/storyblok/Page';
import Logo from '@/components/storyblok/Logo';
import Navigation from '@/components/storyblok/Navigation';
import ContentBlock from '@/components/storyblok/ContentBlock';
import Category from '@/components/storyblok/Category';
import Segment from '@/components/storyblok/Segment';
import Article from '@/components/storyblok/Article';

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
