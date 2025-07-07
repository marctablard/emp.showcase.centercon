import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'flex items-center justify-center border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-danger-500/20 dark:aria-invalid:ring-danger-500/40 aria-invalid:border-danger-500 transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        success: 'border-transparent bg-success-500 text-white [a&]:hover:bg-success-500/90',
        secondary: 'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        warning: 'border-transparent bg-warning-500 text-white [a&]:hover:bg-warning-500/90',
        white: 'border-transparent bg-white text-primary [a&]:hover:bg-white/90',
        black: 'border-transparent bg-black text-white [a&]:hover:bg-black/90',
        destructive:
          'border-transparent bg-danger-500 text-primary-foreground [a&]:hover:bg-danger-500/90 focus-visible:ring-danger-500/20 dark:focus-visible:ring-danger-500/40 dark:bg-danger-500/60',
        outline: 'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        info: 'border-transparent bg-warning-100 text-neutral uppercase [a&]:hover:bg-warning-100/90',
      },
      rounded: {
        none: 'rounded-none',
        rounded_right: 'rounded-r-md',
        default: 'rounded-md',
        lg: 'rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      rounded: 'default',
    },
  },
);

function Badge({
  className,
  variant,
  rounded,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span';

  return <Comp data-slot="badge" className={cn(badgeVariants({ variant, rounded }), className)} {...props} />;
}

export { Badge, badgeVariants };
