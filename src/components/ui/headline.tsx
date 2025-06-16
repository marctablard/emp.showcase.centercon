import { VariantProps, cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const headlineVariants = cva('font-bold text-headlines font-headlines', {
  variants: {
    variant: {
      h1: 'text-5xl lg:text-8xl',
      h2: 'text-5xl/8 lg:text-7xl',
      h3: 'text-4xl/7 lg:text-6xl',
      h4: 'text-3xl/5 lg:text-4xl',
      h5: 'text-2xl/4 lg:text-3xl',
      h6: 'text-xs/3 lg:text-2xl',
      overline: 'text-xs/3 lg:text-base lg:text-primary-500 uppercase tracking-widest',
    },
  },
});

function Headline({
  as,
  className,
  variant,
  children,
  ...props
}: {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | null;
  className?: string;
  children: React.ReactNode;
} & VariantProps<typeof headlineVariants>) {
  const Tag = as || (variant === 'overline' ? 'h4' : variant) || 'h1';
  return (
    <Tag data-slot="headline" className={cn(headlineVariants({ variant }), className)} {...props}>
      {children}
    </Tag>
  );
}

export { Headline };
