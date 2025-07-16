import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'class-variance-authority';
import { ChevronsUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'cursor-pointer uppercase inline-flex items-center justify-center gap-3 whitespace-nowrap px-4 py-3 text-base/6 tracking-widest font-bold transition-all disabled:pointer-events-none disabled:bg-neutral-100 disabled:text-neutral-600 [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white',
  {
    variants: {
      variant: {
        primary: 'bg-primary-500 text-white border border-transparent hover:bg-primary-700 rounded-sm',
        secondary:
          'border border-primary bg-transparent text-primary disabled:border-neutral-600 hover:border-primary-700 hover:bg-primary-50 hover:text-primary-700 rounded-sm ',
        neutral:
          'border border-neutral-900 px-2 py-1 disabled:border-neutral-600 hover:bg-accent hover:text-accent-foreground hover:bg-neutral-900 hover:text-white rounded-sm ',
        red: 'bg-danger-100 text-danger-500 border border-transparent hover:bg-danger-200 rounded-sm normal-case',
        link: 'text-primary disabled:bg-transparent hover:text-primary-700 rounded-sm ',
        link_foreground: 'text-primary-foreground disabled:bg-transparent hover:text-primary-foreground/80 rounded-sm ',
        input: 'bg-primary-500 text-white border border-transparent hover:bg-primary-700 rounded-r-lg',
      },
      size: {
        small: 'px-2 py-1',
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

function BackToTopButton({
  className,
  icon: Icon = ChevronsUp,
  ...props
}: React.ComponentProps<'button'> & { icon?: React.ElementType | null }) {
  return (
    <button
      className={cn(
        'cursor-pointer text-white [&>svg]:size-8 p-2 rounded-full bg-linear-to-t from-primary-700 to-primary-500 hover:to-primary-700 transition-all disabled:bg-none disabled:bg-neutral-400 disabled:pointer-events-none shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        className,
      )}
      {...props}
    >
      {Icon ? <Icon /> : null}
    </button>
  );
}

export { Button, buttonVariants, BackToTopButton };
