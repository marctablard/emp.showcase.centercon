import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from './checkbox';

type RatingContextProps = {
  starsCount?: number;
  disabled?: boolean;
  className?: string;
};

type StarRowProps = {
  starsCount?: number;
  filledCount?: number;
  disabled?: boolean;
  className?: string;
};

type StarProps = {
  filled?: boolean;
  className?: string;
};

function Rating({ className, starsCount, disabled, ...props }: React.ComponentProps<'div'> & RatingContextProps) {
  starsCount ? starsCount++ : 0;
  const rowsCount = starsCount ? starsCount-- : 0;
  return (
    <div data-slot="rating" className={cn('flex flex-col gap-4', className)} {...props}>
      {[...Array(rowsCount).keys()].map((item, i) => {
        return <RatingStarRow starsCount={starsCount} filledCount={item} key={'starRow-' + i} disabled={disabled} />;
      })}
    </div>
  );
}

function RatingStarRow({
  className,
  starsCount,
  filledCount,
  disabled,
  ...props
}: React.ComponentProps<'div'> & StarRowProps) {
  let filled = false;

  return (
    <div
      data-slot="rating"
      className={cn(
        'flex items-center gap-3',
        'text-neutral-500',
        disabled && 'cursor-not-allowed text-neutral-400 disabled:pointer-events-none hover:text-neutral-400',
        className,
      )}
      {...props}
    >
      <Checkbox disabled={disabled} />
      <div
        tabIndex={0}
        className={cn(
          'group flex items-center gap-1',
          'transition duration-150 ease-in-out hover:text-primary-700',
          'focus:outline-2 focus:outline-offset-2 focus:outline-primary-500 focus:rounded focus:text-primary-500',
        )}
      >
        {[...Array(starsCount).keys()].map((item, i) => {
          filled = filledCount ? filledCount - item > 0 : false;
          return <RatingStar filled={filled} key={'star-' + i}></RatingStar>;
        })}
      </div>
    </div>
  );
}

function RatingStar({ className, filled }: React.ComponentProps<'div'> & StarProps) {
  return <Star className={cn('w-6 h-6', filled && 'fill-current', className)} />;
}

export { Rating };
