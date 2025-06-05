'use client';

import Image from 'next/image';
import Link from 'next/link';
import { storyblokEditable } from '@storyblok/react/rsc';

/**
 * Category component for Storyblok
 * Displays a product category with title, description, and banner
 */
interface CategoryProps {
  blok: {
    title?: string;
    description?: string;
    emporix_category_id?: string;
    banner?: {
      filename: string;
      alt?: string;
    };
    highlight?: boolean;
    site?: string;
  };
}

const Category = ({ blok }: CategoryProps) => {
  // Generate URL for the category
  const categoryUrl = blok.emporix_category_id ? `/browse/${blok.emporix_category_id}` : '#';

  return (
    <div
      {...storyblokEditable(blok)}
      className={`category-card rounded-lg overflow-hidden shadow-md ${blok.highlight ? 'border-2 border-primary' : ''}`}
    >
      {/* Banner image */}
      {blok.banner?.filename && (
        <div className="relative h-48">
          <Image
            src={blok.banner.filename}
            alt={blok.banner.alt || blok.title || 'Category'}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {blok.title && <h3 className="text-xl font-bold mb-2">{blok.title}</h3>}

        {blok.description && <p className="text-neutral-600 mb-4 line-clamp-2">{blok.description}</p>}

        <Link href={categoryUrl} className="text-primary hover:underline font-medium">
          View Products
        </Link>
      </div>
    </div>
  );
};

export default Category;
