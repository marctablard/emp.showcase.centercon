'use client';

import { StoryblokServerComponent, storyblokEditable } from '@storyblok/react/rsc';

/**
 * Page component for Storyblok
 * A container component that renders child components in a page layout
 * Fields: Title (for navigation), Slug, Url, List of Content Blocks, Site
 */
interface PageProps {
  blok: {
    title?: string; // Title for navigation
    slug?: string; // URL slug
    url?: string; // Full URL
    body?: any[]; // List of Content Blocks
    site?: string; // Site identifier
  };
}

const Page = ({ blok }: PageProps) => {
  return (
    <div {...storyblokEditable(blok)} className="mx-auto">
      {blok.title && <h1 className="text-3xl font-bold mb-6">{blok.title}</h1>}

      <div className="space-y-8">
        {blok.body?.map((nestedBlok) => <StoryblokServerComponent blok={nestedBlok} key={nestedBlok._uid} />)}
      </div>
    </div>
  );
};

export default Page;
