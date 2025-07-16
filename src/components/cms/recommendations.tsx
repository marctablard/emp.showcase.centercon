'use client';

import { storyblokEditable } from '@storyblok/react/rsc';
import { LucideChevronLeft, LucideChevronRight } from 'lucide-react';
import { useProducts } from '@/hooks/product/useProducts';
import { useRecommendations } from '@/hooks/recommendations/useRecommendations';
import { Product } from '@/platform/services/model/product';
import { ProductTile } from '../product/product-tile';
import { ProductTileSkeleton } from '../product/product-tile-skeleton';
import { Carousel, CarouselContent, CarouselDots, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel';
import { Headline } from '../ui/headline';

interface RecommendationsProps {
  blok: {
    overline?: string;
    headline?: string;
    productId?: Product['id'];
    products?: string;
    locale?: string;
  };
}

const Recommendations = ({ blok }: RecommendationsProps) => {
  const hasProductId = !!blok.productId;
  // get product ids as string because of storyblok and transform it to array
  const transformProducts = blok.products?.split(', ');
  const hasProducts = Array.isArray(transformProducts) && transformProducts.length > 0;

  // Fetch recommendations or products
  const { recommendations, loading: recLoading, error } = useRecommendations(blok.productId);
  const { products: productList, loading: productsLoading } = useProducts(transformProducts);

  const recommendationsToShow = hasProductId ? (recommendations?.products ?? []) : (productList ?? []);

  // Handle error state
  if (error) {
    return null;
  }

  if ((!hasProductId && !hasProducts) || recommendationsToShow.length === 0) {
    return null;
  }

  return (
    <div {...storyblokEditable(blok)} className="py-8 max-w-6xl mx-auto px-4 lg:px-9">
      {blok.overline && (
        <Headline variant="overline" as="h4" className="mb-3">
          {blok.overline}
        </Headline>
      )}

      <div className="w-full relative">
        <Carousel className="w-full " orientation="horizontal">
          {blok.headline && (
            <Headline variant="h2" as="h4" className="md:pr-36">
              {blok.headline}
            </Headline>
          )}

          <CarouselContent className="mt-8 mb-8">
            {(hasProductId && recLoading) || (hasProducts && productsLoading) ? (
              <>
                {Array.from({ length: 5 }, (_, i) => (
                  <CarouselItem key={i + 1} size="basis-1/5.5">
                    <div className="relative w-[322px] h-full">
                      <ProductTileSkeleton />
                    </div>
                  </CarouselItem>
                ))}
              </>
            ) : (
              <>
                {Array.isArray(recommendationsToShow) &&
                  recommendationsToShow.map((product, index) => (
                    <CarouselItem key={index} size="basis-1/5.5">
                      <div className="relative w-[322px] h-full">
                        <ProductTile product={product} />
                      </div>
                    </CarouselItem>
                  ))}
              </>
            )}
          </CarouselContent>

          <CarouselDots />

          <CarouselPrevious className="hidden md:flex top-0 right-20 bottom-1 h-10 w-10 rounded-full bg-white border-primary">
            <LucideChevronLeft className="h-6 w-6 text-primary" />
          </CarouselPrevious>
          <CarouselNext className="hidden md:flex top-0 right-4 bottom-1 h-10 w-10 rounded-full bg-white border-primary">
            <LucideChevronRight className="h-6 w-6 text-primary" />
          </CarouselNext>
        </Carousel>
      </div>
    </div>
  );
};

export type { RecommendationsProps };
export default Recommendations;
