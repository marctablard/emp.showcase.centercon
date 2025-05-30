'use client';

import { storyblokEditable } from '@storyblok/react/rsc';

/**
 * Teaser component for Storyblok
 * Displays a simple teaser with headline
 */
interface TeaserProps {
  blok: {
    headline?: string;
  };
}

const Teaser = ({ blok }: TeaserProps) => {
  return (
    <div {...storyblokEditable(blok)} className="p-6 bg-gray-100 rounded-lg shadow-sm text-center mb-6">
      <h2 className="text-2xl font-bold mb-4">{blok.headline || 'Hello world!'}</h2>
    </div>
  );
};

export default Teaser;
