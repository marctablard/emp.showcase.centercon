import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.ComponentProps<'input'> {
  startIcon?: LucideIcon;
  endIcon?: LucideIcon;
}

function Input({ className, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'placeholder:text-neutral-300 text-neutral-800 flex w-full min-w-0 rounded-sm bg-transparent py-3 text-base transition-[color,box-shadow] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-base file:font-medium  disabled:cursor-not-allowed disabled:opacity-50 md:text-base',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-600',
        'focus-visible:outline-none',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
