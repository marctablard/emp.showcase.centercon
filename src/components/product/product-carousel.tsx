'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { LucideChevronLeft, LucideChevronRight, LucidePlay } from 'lucide-react';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useL10n } from '@/hooks/useL10n';
import { imageSizes } from '@/lib/utils';
import { Media } from '@/platform/services/model/common';

interface ProductCarouselProps {
  images: Media[] | undefined;
}

export function ProductCarousel({ images }: ProductCarouselProps) {
  const { l10n } = useL10n();

  const [mainApi, setMainApi] = useState<CarouselApi>();
  const [thumbApi, setThumbApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);

  // Sync the main carousel with the thumbnail carousel
  useEffect(() => {
    if (!mainApi || !thumbApi) return;

    const onSelect = () => {
      const index = mainApi.selectedScrollSnap();
      setActiveIndex(index);
      thumbApi.scrollTo(index);
    };

    mainApi.on('select', onSelect);
    return () => {
      mainApi.off('select', onSelect);
    };
  }, [mainApi, thumbApi]);

  if (!images || images.length === 0) {
    return (
      <div className="bg-neutral-200 h-96 flex items-center justify-center">
        <span className="text-neutral-500">No images available</span>
      </div>
    );
  }
  return (
    <div className="flex gap-4">
      {/* Main Carousel */}
      <div className="w-4/5 relative">
        <Carousel className="w-full " orientation="horizontal" setApi={setMainApi}>
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={index}>
                <div className="relative h-[500px] w-full">
                  <Image
                    src={image.url}
                    alt={image.altText ? l10n(image.altText) : `Product image ${index + 1}`}
                    fill
                    sizes={imageSizes}
                    priority={index === 0}
                    className="object-cover object-center"
                  />
                  {image.contentType?.startsWith('video/') && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white/80 rounded-full p-3">
                        <LucidePlay className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="right-14 bottom-1 h-8 w-8 rounded-full bg-white border-primary">
            <LucideChevronLeft className="h-6 w-6 text-primary" />
          </CarouselPrevious>
          <CarouselNext className="right-4 bottom-1 h-8 w-8 rounded-full bg-white border-primary">
            <LucideChevronRight className="h-6 w-6 text-primary" />
          </CarouselNext>
        </Carousel>
      </div>

      {/* Thumbnail Carousel - Vertical on the right */}
      <div className="w-1/5">
        <div className="h-[500px] overflow-hidden">
          <Carousel className="h-full" orientation="vertical" setApi={setThumbApi}>
            <CarouselContent className="h-full flex-col !-mt-0 gap-2 p-1">
              {images.map((image, index) => (
                <CarouselItem
                  key={index}
                  className="basis-1/5 min-h-0 cursor-pointer !pt-0 flex items-center justify-center"
                  onClick={() => mainApi?.scrollTo(index)}
                >
                  <div
                    className={`aspect-[4/3] w-full h-full relative rounded-md overflow-hidden ${activeIndex === index ? 'ring-2 ring-primary' : 'border border-gray-200'}`}
                  >
                    <Image
                      src={image.url}
                      alt={image.altText ? l10n(image.altText) : `Thumbnail ${index + 1}`}
                      fill
                      sizes={imageSizes}
                      className="object-cover object-center"
                    />
                    {image.contentType?.startsWith('video/') && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10">
                        <LucidePlay className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </div>
  );
}
