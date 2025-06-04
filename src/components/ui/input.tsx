import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.ComponentProps<'input'> {
  startIcon?: LucideIcon;
  endIcon?: LucideIcon;
  isDisabled?: boolean;
  hasError?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, isDisabled, startIcon, endIcon, hasError, ...props }, ref) => {
    const StartIcon = startIcon;
    const EndIcon = endIcon;
    return (
      <div
        className={cn(
          'w-full relative text-gray-900',
          !isDisabled && 'hover:text-blue-700',
          hasError && 'text-red-500',
        )}
      >
        {StartIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <StartIcon size={24} />
          </div>
        )}

        <input
          type={type}
          data-slot="input"
          className={cn(
            'placeholder:text-muted-foreground border-input flex w-full min-w-0 rounded-xs border bg-transparent ps-10 pe-10 py-3 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-base file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-base',
            'focus:ring-3 focus:ring-blue-500',
            'hover:border-blue-700 hover:outline-2',
            'disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-100',
            'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
            hasError && 'border-red-500',
            className,
          )}
          {...props}
        />

        {EndIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <EndIcon size={24} />
          </div>
        )}
      </div>
    );
  },
);

/* function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
 
} */

export { Input };
