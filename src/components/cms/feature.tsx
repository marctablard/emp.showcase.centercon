'use client';

import { storyblokEditable } from '@storyblok/react/rsc';

/**
 * Feature component for Storyblok
 * Renders a feature block with name and description
 */
interface FeatureProps {
  blok: {
    name: string;
    description: string;
  };
}

const Feature = ({ blok }: FeatureProps) => {
  return (
    <div {...storyblokEditable(blok)} className="p-6 border rounded-lg shadow-sm">
      <h3 className="text-xl font-bold mb-2">{blok.name}</h3>
      <p className="text-neutral-600">{blok.description}</p>
    </div>
  );
};

export default Feature;
