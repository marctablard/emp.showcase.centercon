import React from 'react';
import { Check, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from './checkbox';

type RatingContextProps = {
  count: number;
  className?: string;
};

function Rating({ className, count, ...props }: React.ComponentProps<'div'> & RatingContextProps) {
  return (
    <div data-slot="rating" className={cn('flex items-center', className)} {...props}>
      <Checkbox />
      {count}
      <Star />
    </div>
  );
}

export { Rating };
