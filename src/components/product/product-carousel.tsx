'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
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
        <span className="text-neutral-500"></span>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {/* Main Carousel */}
      <Carousel className="w-full" setApi={setMainApi}>
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
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>

      {/* Thumbnail Carousel */}
      <Carousel className="w-full" setApi={setThumbApi}>
        <CarouselContent className="flex justify-center">
          {images.map((image, index) => (
            <CarouselItem key={index} className="basis-1/5 md:basis-1/5 lg:basis-1/5 cursor-pointer">
              <div
                className={`relative h-20 w-full border rounded-md overflow-hidden ${activeIndex === index ? 'ring-2 ring-primary' : ''}`}
                onClick={() => {
                  mainApi?.scrollTo(index);
                }}
              >
                <Image
                  src={image.url}
                  alt={image.altText ? l10n(image.altText) : `Thumbnail ${index + 1}`}
                  fill
                  sizes={imageSizes}
                  className="object-cover object-center"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
