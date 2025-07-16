import { apiPlugin, storyblokInit } from '@storyblok/react/rsc';
import Article from '@/components/cms/article';
import Button from '@/components/cms/button';
import Category from '@/components/cms/category';
import Columns from '@/components/cms/columns';
import ContentBlock from '@/components/cms/content-block';
import Feature from '@/components/cms/feature';
import Grid from '@/components/cms/grid';
import Hero from '@/components/cms/hero';
import Logo from '@/components/cms/logo';
import MediaText from '@/components/cms/media-text';
import Navigation from '@/components/cms/navigation';
import Page from '@/components/cms/page';
import QuickEntry from '@/components/cms/quick-entry';
import Recommendations from '@/components/cms/recommendations';
import Segment from '@/components/cms/segment';
import Teaser from '@/components/cms/teaser';

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
    button: Button,
    hero: Hero,
    quick_entry: QuickEntry,
    media_text: MediaText,
    recommendations: Recommendations,
  },
});
