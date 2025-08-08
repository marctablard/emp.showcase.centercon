'use client';

import Image from 'next/image';
import { storyblokEditable } from '@storyblok/react/rsc';

/**
 * Logo component for Storyblok
 * Displays a logo image with alt text
 */
interface LogoProps {
  blok: {
    site?: string;
    image?: {
      filename: string;
      alt?: string;
    };
    alt_text?: string;
  };
}

const Logo = ({ blok }: LogoProps) => {
  if (!blok.image?.filename) {
    return null;
  }

  return (
    <div {...storyblokEditable(blok)} className="logo">
      <Image
        src={blok.image.filename}
        alt={blok.alt_text || blok.image?.alt || 'Logo'}
        width={150}
        height={50}
        className="object-contain"
      />
    </div>
  );
};

export default Logo;
