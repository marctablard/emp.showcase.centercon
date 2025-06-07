'use client';

import * as React from 'react';
import { useRef } from 'react';
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  FormProvider,
  useFormContext,
  useFormState,
} from 'react-hook-form';
import * as LabelPrimitive from '@radix-ui/react-label';
import { Slot } from '@radix-ui/react-slot';
import { LucideIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    disabled: formState.disabled,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

export interface ControlProps extends React.ComponentProps<typeof Slot> {
  startIcon?: LucideIcon;
  endIcon?: LucideIcon;
  isDropdown?: boolean;
  isSelectItem?: boolean;
  validate?: boolean;
}

export interface LabelProps extends React.ComponentProps<typeof LabelPrimitive.Root> {
  isOptional?: boolean;
  hasTooltip?: boolean;
}

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

function FormItem({ className, ...props }: React.ComponentProps<'div'>) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div data-slot="form-item" className={cn('grid gap-2 leading-0', className)} {...props} />
    </FormItemContext.Provider>
  );
}

function FormLabel({ className, isOptional, hasTooltip, ...props }: LabelProps) {
  const { error, formItemId } = useFormField();

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn('', className)}
      htmlFor={formItemId}
      isOptional={isOptional}
      hasTooltip={hasTooltip}
      {...props}
    />
  );
}

function FormControl({ endIcon, startIcon, validate, isDropdown, ...props }: ControlProps) {
  const { error, formItemId, formDescriptionId, formMessageId, isTouched, isDirty } = useFormField();
  const StartIcon = startIcon;
  const EndIcon = endIcon;
  const ref = useRef<HTMLDivElement>(null);

  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      {...props}
    >
      <div
        ref={ref}
        onFocus={() => ref.current?.classList.add('outline-2', 'outline-offset-2', 'outline-primary-500')}
        onBlur={() => ref.current?.classList.remove('outline-2', 'outline-offset-2', 'outline-primary-500')}
        className={cn(
          'relative text-neutral-900 border border-neutral-200 rounded-sm',
          'transition duration-150 ease-in-out hover:border-primary-500 hover:text-primary-700 hover:bg-white',
          error && 'text-danger-500 border-danger-500',
          error && 'hover:border-danger-500 hover:text-danger-500',
          validate && isTouched && !error && 'text-success-500 border-success-500',
          validate && isDirty && !error && 'bg-success-100',
          isDirty && error && 'bg-danger-100',
          isDirty && error && 'hover:bg-danger-100',
        )}
      >
        {!isDropdown && (startIcon || endIcon) ? (
          <FormIcon startIcon={StartIcon} endIcon={EndIcon}>
            {props.children}
          </FormIcon>
        ) : (
          <div>{props.children} </div>
        )}
      </div>
    </Slot>
  );
}

function FormIcon({ endIcon, startIcon, isDropdown, isSelectItem, ...props }: ControlProps) {
  const StartIcon = startIcon;
  const EndIcon = endIcon;

  return (
    <Slot data-slot="form-icon" {...props}>
      <div
        className={cn(
          'w-full relative px-3 outline-none',
          isDropdown && 'text-left',
          isSelectItem && ' hover:bg-primary-500 hover:text-white',
          startIcon && !isDropdown && 'pl-10',
          endIcon && !isDropdown && 'pr-10',
          isDropdown && startIcon && 'pl-10',
          isDropdown && endIcon && 'pr-10',
        )}
      >
        {StartIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <StartIcon size={20} />
          </div>
        )}
        {props.children}
        {EndIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <EndIcon size={20} />
          </div>
        )}
      </div>
    </Slot>
  );
}

function FormDescription({ className, ...props }: React.ComponentProps<'p'>) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn('text-muted-foreground text-xs', className)}
      {...props}
    />
  );
}

function FormMessage({ className, ...props }: React.ComponentProps<'p'>) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? '') : props.children;

  if (!body) {
    return null;
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn('text-destructive text-sm text-danger-500', className)}
      {...props}
    >
      {body}
    </p>
  );
}

export { useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField, FormIcon };
