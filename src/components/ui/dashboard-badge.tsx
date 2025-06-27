import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'flex items-center justify-center border p-1 text-xs font-bold uppercase w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive text-black transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        primary: 'border-primary-500 bg-primary-50 ',
        default: 'border-neutral-200 bg-neutral-100',
        success: 'border-success-500 bg-success-100',
        warning: 'border-warning-500 bg-warning-100',
      },
      rounded: {
        none: 'rounded-none',
        rounded_right: 'rounded-r-md',
        default: 'rounded-md',
        lg: 'rounded-lg',
        sm: 'rounded-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      rounded: 'sm',
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
