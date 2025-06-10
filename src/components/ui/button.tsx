import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'cursor-pointer uppercase inline-flex items-center justify-center gap-3 whitespace-nowrap px-4 py-3 text-base/6 tracking-widest font-bold transition-all disabled:pointer-events-none disabled:bg-neutral-100 disabled:text-neutral-600 [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white',
  {
    variants: {
      variant: {
        primary: 'bg-primary-500 text-white border border-transparent hover:bg-primary-700 rounded-sm ',
        secondary:
          'border border-primary bg-transparent text-primary disabled:border-neutral-600 hover:border-primary-700 hover:bg-primary-50 hover:text-primary-700 rounded-sm ',
        neutral:
          'border border-neutral-900 px-2 py-1 disabled:border-neutral-600 hover:bg-accent hover:text-accent-foreground hover:bg-neutral-900 hover:text-white rounded-sm ',
        link: 'text-primary disabled:bg-transparent hover:text-primary-700 rounded-sm ',
        input: 'bg-primary-500 text-white border border-transparent hover:bg-primary-700 rounded-r-lg',
      },
      size: {
        default: 'px-4 py-3',
        icon: 'p-3',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
