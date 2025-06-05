import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.ComponentProps<'input'> {
  spaceStart?: boolean;
  spaceEnd?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, spaceStart, spaceEnd, ...props }, ref) => {
    return (
      <input
        type={type}
        data-slot="input"
        className={cn(
          'placeholder:text-neutral-300 border-input flex w-full min-w-0 rounded-sm bg-transparent px-3 py-3 text-base transition-[color,box-shadow] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-base file:font-medium  disabled:cursor-not-allowed disabled:opacity-50 md:text-base',
          'focus:outline-2 focus:outline-offset-2 focus:outline-primary-500',
          'disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-600',
          'aria-invalid:border-red-500 dark:aria-invalid:ring-destructive/40 aria-invalid:bg-red-200',
          spaceStart && 'pl-10',
          spaceEnd && 'pr-10',
          className,
        )}
        {...props}
      />
    );
  },
);

/* function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
 
} */

export { Input };
