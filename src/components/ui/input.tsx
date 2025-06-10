import * as React from 'react';
import { ArrowRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

export interface InputProps extends React.ComponentProps<'input'> {
  startIcon?: LucideIcon;
  endIcon?: LucideIcon;
  isButton?: boolean;
}

function Input({ className, type, startIcon, endIcon, isButton, ...props }: InputProps) {
  const StartIcon = startIcon;
  const EndIcon = endIcon;
  const dataSuccess = 'data-success' in props ? (props['data-success'] as boolean) : false;
  const dataDirtySuccess = 'data-dirty-success' in props ? (props['data-dirty-success'] as boolean) : false;
  const dataDirtyError = 'data-dirty-error' in props ? (props['data-dirty-error'] as boolean) : false;

  return (
    <div
      className={cn(
        'w-full relative ',
        'transition hover:text-primary-700 hover:bg-white',
        dataSuccess && 'text-success-500 border-success-500',
        props.disabled && 'text-neutral-600 border-neutral-300 hover:text-neutral-600',
        props['aria-invalid'] && 'border-danger-500 text-danger-500',
      )}
    >
      {StartIcon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <StartIcon size={20} />
        </div>
      )}
      <input
        type={type}
        data-slot="input"
        className={cn(
          'text-neutral-900 flex w-full min-w-0 px-3 border border-neutral-200 rounded-l-lg',
          !isButton && 'rounded-sm',
          startIcon && 'pl-10',
          endIcon && 'pr-10',
          'placeholder:text-neutral-300 py-3 text-base md:text-base',
          'transition duration-150 ease-in-out hover:border-primary-500 hover:text-primary-700 hover:border-primary-700 hover:bg-white',
          'disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-600',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
          'aria-invalid:text-danger-500 aria-invalid:border-danger-500 hover:aria-invalid:border-primary-500 hover:aria-invalid:text-primary-700',
          'data-[success=true]:border-success-500 hover:data-[success=true]:border-primary-500 hover:data-[success=true]:text-primary-700',
          dataDirtySuccess && 'bg-success-100 hover:border-primary-500 hover:text-primary-700',
          dataDirtyError && 'bg-danger-100 hover:border-primary-500 hover:text-primary-700',
          className,
        )}
        {...props}
      />

      {EndIcon && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <EndIcon size={20} />
        </div>
      )}
    </div>
  );
}

function InputButton({ className, type, startIcon, endIcon, ...props }: InputProps) {
  return (
    <div className={cn('flex items-center')}>
      <Input startIcon={startIcon} endIcon={endIcon} isButton {...props} />
      <Button variant="input">
        <ArrowRight />
        Button
        <ArrowRight />
      </Button>
    </div>
  );
}

export { Input, InputButton };
