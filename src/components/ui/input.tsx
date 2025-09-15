import * as React from 'react';
import { cva } from 'class-variance-authority';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

export interface InputProps extends React.ComponentProps<'input'> {
  startIcon?: LucideIcon;
  endIcon?: LucideIcon;
  isButton?: boolean;
  iconButtonBefore?: LucideIcon;
  iconButtonAfter?: LucideIcon;
  buttonText?: string;
  buttonLabel?: string;
  onEndIconClick?: () => void;
  endIconLabel?: string;
}

const inputVariants = cva(
  [
    'text-neutral-900 flex w-full min-w-0 px-3 border border-neutral-200',
    'placeholder:text-neutral-300 py-3 text-base md:text-base',
    'transition duration-150 ease-in-out hover:text-primary-700 hover:border-primary-700 hover:bg-white',
    'disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-600',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
    'aria-invalid:text-danger-500 aria-invalid:border-danger-500 hover:aria-invalid:border-primary-500 hover:aria-invalid:text-primary-700',
    'data-[success=true]:border-success-500 hover:data-[success=true]:border-primary-500 hover:data-[success=true]:text-primary-700',
  ],
  {
    variants: {
      isButton: {
        true: 'rounded-l-lg',
        false: 'rounded-sm',
      },
      startIcon: {
        true: 'pl-10',
        false: '',
      },
      endIcon: {
        true: 'pr-10',
        false: '',
      },
      dataDirtySuccess: {
        true: 'bg-success-100 hover:border-primary-500 hover:text-primary-700',
        false: '',
      },
      dataDirtyError: {
        true: 'bg-danger-100 hover:border-primary-500 hover:text-primary-700',
        false: '',
      },
    },
    defaultVariants: {
      isButton: false,
      startIcon: false,
      endIcon: false,
      dataDirtySuccess: false,
      dataDirtyError: false,
    },
  },
);

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, startIcon, endIcon, isButton, onEndIconClick, endIconLabel, ...props }, ref) => {
    const StartIcon = startIcon;
    const EndIcon = endIcon;
    const dataSuccess = 'data-success' in props ? (props['data-success'] as boolean) : false;
    const dataDirtySuccess = 'data-dirty-success' in props ? (props['data-dirty-success'] as boolean) : false;
    const dataDirtyError = 'data-dirty-error' in props ? (props['data-dirty-error'] as boolean) : false;

    return (
      <div
        className={cn(
          'w-full h-full relative',
          'transition hover:text-primary-700 hover:bg-white',
          dataSuccess && 'text-success-500 border-success-500',
          props.disabled && 'text-neutral-600 border-neutral-300 hover:text-neutral-600',
          props['aria-invalid'] && 'border-danger-500 text-danger-500',
        )}
      >
        {StartIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <StartIcon size={24} />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          data-slot="input"
          className={cn(
            inputVariants({
              isButton: !!isButton,
              startIcon: !!startIcon,
              endIcon: !!endIcon,
              dataDirtySuccess: !!dataDirtySuccess,
              dataDirtyError: !!dataDirtyError,
              className,
            }),
          )}
          {...props}
        />

        {EndIcon && onEndIconClick && (
          <div
            className={cn(
              'absolute right-3 top-1/2 transform -translate-y-1/2',
              'cursor-pointer hover:text-primary-700',
            )}
            onClick={onEndIconClick}
            tabIndex={0}
            role="button"
            aria-label={endIconLabel}
          >
            <EndIcon size={24} />
          </div>
        )}
        {EndIcon && !onEndIconClick && (
          <div className={cn('absolute right-3 top-1/2 transform -translate-y-1/2')}>
            <EndIcon size={24} />
          </div>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

const InputButton = React.forwardRef<HTMLInputElement, InputProps>(
  ({ startIcon, endIcon, iconButtonBefore, iconButtonAfter, buttonText, buttonLabel, ...props }, ref) => {
    const ButtonStartIcon = iconButtonBefore;
    const ButtonEndIcon = iconButtonAfter;
    return (
      <div className={cn('flex items-center')}>
        <Input ref={ref} startIcon={startIcon} endIcon={endIcon} isButton {...props} />
        <Button variant="input" aria-label={buttonLabel}>
          {ButtonStartIcon && <ButtonStartIcon />}
          {buttonText}
          {ButtonEndIcon && <ButtonEndIcon />}
        </Button>
      </div>
    );
  },
);

InputButton.displayName = 'InputButton';

export { Input, InputButton, inputVariants };
