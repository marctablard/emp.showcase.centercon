'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn('relative flex w-full touch-none select-none items-center', className)}
    {...props}
  >
    <SliderPrimitive.Track
      className={cn(
        'relative h-2.5 w-full grow overflow-hidden rounded-full bg-primary-50 border border-neutral-200',
        'data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed data-[disabled]:bg-neutral-100',
      )}
    >
      <SliderPrimitive.Range className={cn('absolute h-full bg-primary-500 data-[disabled]:bg-neutral-400')} />
    </SliderPrimitive.Track>
    {(props.value ?? props.defaultValue)?.map((_, index) => (
      <SliderPrimitive.Thumb
        key={index}
        className={cn(
          'block h-6 w-6 rounded-full border-2 border-white bg-primary-500 shadow transition-colors ',
          'hover:bg-primary-700',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
          'data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed data-[disabled]:bg-neutral-100 data-[disabled]:border-neutral-300',
        )}
      />
    ))}
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
