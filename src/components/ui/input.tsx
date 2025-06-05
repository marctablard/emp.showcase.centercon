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
          'placeholder:text-muted-foreground border-input flex w-full min-w-0 rounded-sm border bg-transparent px-3 py-3 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-base file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-base',
          'focus:ring-3 focus:ring-indigo-500',
          'hover:border-indigo-700 hover:outline-2',
          'disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-100 disabled:text-gray-300',
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
