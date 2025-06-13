import Link from 'next/link';
import { VariantProps, cva } from 'class-variance-authority';

const linkVariants = cva(
  'outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white',
  {
    variants: {
      variant: {
        primary:
          'inline-flex items-center gap-1 text-primary font-bold underline hover:text-primary-700 disabled:text-neutral-300 disabled:[&_svg]:text-neutral-600',
        secondary:
          'inline-flex items-center gap-1 text-body hover:underline hover:text-primary-500 disabled:hover:no-underline disabled:text-neutral-300 disabled:[&_svg]:text-neutral-600',
        text: 'text-primary underline hover:text-primary-700',
      },
      size: {
        s: 'text-sm [&_svg]:w-4 [&_svg]:h-4',
        m: 'text-base ',
        l: 'text-xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  },
);

interface LinkProps {
  type: 'Button' | 'A' | 'Link';
  href?: string;
  disabled?: boolean;
  iconBefore?: React.ReactNode | undefined;
  iconAfter?: React.ReactNode | undefined;
  children?: React.ReactNode | undefined;
}

export default function UiLink({
  variant,
  size,
  type,
  iconBefore,
  iconAfter,
  href = '#',
  ...props
}: LinkProps &
  VariantProps<typeof linkVariants> & {
    asChild?: boolean;
  }) {
  const classes = linkVariants({ variant, size });
  switch (type) {
    case 'Link':
      return (
        <Link href={href} className={classes} {...props}>
          {iconBefore}
          {props.children}
          {iconAfter}
        </Link>
      );
    case 'A':
      return (
        <a href={href} className={classes}>
          {iconBefore}
          {props.children}
          {iconAfter}
        </a>
      );
    case 'Button':
      return (
        <button type="button" className={classes} {...props}>
          {iconBefore}
          {props.children}
          {iconAfter}
        </button>
      );
  }
}
