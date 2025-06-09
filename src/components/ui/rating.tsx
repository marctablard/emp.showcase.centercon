import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

type RatingContextProps = {
  count: number;
  className?: string;
};

function Rating({ className, count, ...props }: React.ComponentProps<'div'> & RatingContextProps) {
  return (
    <div data-slot="rating" className={cn('flex items-center', className)} {...props}>
      <div>
        {count}
        <Star />
      </div>
    </div>
  );
}

export { Rating };
