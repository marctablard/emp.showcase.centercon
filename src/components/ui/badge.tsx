import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'flex items-center justify-center border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        success: 'border-transparent bg-success text-white [a&]:hover:bg-success/90',
        secondary: 'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        warning: 'border-transparent bg-warning-500 text-white [a&]:hover:bg-warning/90',
        white: 'border-transparent bg-white text-primary [a&]:hover:bg-white/90',
        // TODO take over into globals.css as destructive variable
        destructive:
          'border-transparent bg-[#BF0D0D] text-primary-foreground [a&]:hover:bg-[#BF0D0D]/90 focus-visible:ring-[#BF0D0D]/20 dark:focus-visible:ring-[#BF0D0D]/40 dark:bg-[#BF0D0D]/60',
        outline: 'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        // TODO check naming from styleguide
        promo: 'border-transparent bg-[#F7DECF] text-neutral [a&]:hover:bg-[#F7DECF]/90',
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
