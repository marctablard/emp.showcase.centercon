'use client';

import { storyblokEditable, renderRichText } from '@storyblok/react/rsc';
import Link from 'next/link';

/**
 * Article component for Storyblok
 * Displays an article with title, introduction, video, rich text, and linked products
 */
interface ArticleProps {
  blok: {
    title?: string;
    introduction?: string;
    video?: {
      url?: string;
      title?: string;
    };
    content?: any; // Rich text content
    linked_products?: Array<{
      _uid: string;
      product_id?: string;
      name?: string;
    }>;
  };
}

const Article = ({ blok }: ArticleProps) => {
  return (
    <article {...storyblokEditable(blok)} className="article max-w-4xl mx-auto py-8">
      {/* Article header */}
      <header className="mb-8">
        {blok.title && (
          <h1 className="text-3xl font-bold mb-4">{blok.title}</h1>
        )}
        
        {blok.introduction && (
          <div className="text-xl text-gray-600 mb-6">{blok.introduction}</div>
        )}
      </header>
      
      {/* Video */}
      {blok.video?.url && (
        <div className="mb-8">
          <iframe
            src={blok.video.url}
            title={blok.video.title || 'Video'}
            className="w-full aspect-video rounded-lg"
            allowFullScreen
          ></iframe>
        </div>
      )}
      
      {/* Rich text content */}
      {blok.content && (
        <div className="prose max-w-none mb-8">
          {renderRichText(blok.content)}
        </div>
      )}
      
      {/* Linked products */}
      {blok.linked_products && blok.linked_products.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Related Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blok.linked_products.map((product) => (
              <div key={product._uid} className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">{product.name}</h3>
                {product.product_id && (
                  <Link 
                    href={`/product/${product.product_id}`}
                    className="text-primary hover:underline"
                  >
                    View Product
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};

export default Article;
