'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react';
import { LucideChevronLeft, LucideChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: 'horizontal' | 'vertical';
  setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  selectedIndex: number;
  scrollTo: (index: number) => void;
} & CarouselProps;

interface CarouselItemProps extends React.ComponentProps<'div'> {
  className?: string;
  size?: string;
}
const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />');
  }

  return context;
}

function Carousel({
  orientation = 'horizontal',
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === 'horizontal' ? 'x' : 'y',
    },
    plugins,
  );
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext],
  );

  const scrollTo = React.useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api],
  );

  React.useEffect(() => {
    if (!api || !setApi) return;
    setApi(api);
  }, [api, setApi]);

  React.useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on('reInit', onSelect);
    api.on('select', onSelect);

    return () => {
      api?.off('select', onSelect);
    };
  }, [api, onSelect]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation: orientation || (opts?.axis === 'y' ? 'vertical' : 'horizontal'),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
        scrollTo,
        selectedIndex,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn('relative', className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

function CarouselContent({ className, ...props }: React.ComponentProps<'div'>) {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div ref={carouselRef} className="overflow-hidden" data-slot="carousel-content">
      <div className={cn('flex', orientation === 'horizontal' ? '-ml-4' : '-mt-4 flex-col', className)} {...props} />
    </div>
  );
}

function CarouselItem({ size, className, ...props }: CarouselItemProps) {
  const { orientation } = useCarousel();

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        'min-w-0 shrink-0 grow-0',
        size ? size : 'basis-full',
        orientation === 'horizontal' ? 'pl-4' : 'pt-4',
        className,
      )}
      {...props}
    />
  );
}

function CarouselDots({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { api, selectedIndex, scrollTo } = useCarousel();
  const t = useTranslations('UI.Carousel');

  return (
    <div
      data-slot="carousel-dots"
      className={cn('mb-2 flex w-full items-center justify-center gap-4', className)}
      {...props}
    >
      {api
        ?.scrollSnapList()
        .map((_, index) => (
          <button
            key={index}
            title={t('pageTitle', { index: index + 1 })}
            className={cn(
              'cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white',
              index === selectedIndex
                ? 'h-4 w-4 bg-linear-to-t from-primary-700 to-primary-500 hover:to-primary-700 hover:border hover:border-primary-500'
                : 'h-3 w-3 bg-white border border-primary-500 hover:bg-primary-50 hover:border-primary-700 disabled:bg-none disabled:bg-neutral-400 disabled:pointer-events-none ',
            )}
            onClick={() => scrollTo(index)}
          ></button>
        ))}
    </div>
  );
}

function CarouselPrevious({
  className,
  variant = 'secondary',
  size = 'icon',
  ...props
}: React.ComponentProps<typeof Button>) {
  const { scrollPrev, canScrollPrev } = useCarousel();
  const t = useTranslations('UI.Carousel');
  const classes = cn('absolute size-8 rounded-full', className);

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={classes}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      title={t('prev')}
      {...props}
    >
      <LucideChevronLeft aria-label="Previous slide" />
    </Button>
  );
}

function CarouselNext({
  className,
  variant = 'secondary',
  size = 'icon',
  ...props
}: React.ComponentProps<typeof Button>) {
  const { scrollNext, canScrollNext } = useCarousel();
  const t = useTranslations('UI.Carousel');
  const classes = cn('absolute size-8 rounded-full', className);

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={classes}
      disabled={!canScrollNext}
      onClick={scrollNext}
      title={t('next')}
      {...props}
    >
      <LucideChevronRight aria-label="Next slide" />
    </Button>
  );
}

export { type CarouselApi, Carousel, CarouselContent, CarouselItem, CarouselDots, CarouselPrevious, CarouselNext };
