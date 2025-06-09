import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isEqual } from 'lodash';
import z from 'zod/v4';
import { getService } from '@/lib/client/service';
import { ValidationService } from '@/platform/services/validation';

/**
 * Hook for using a validation service with a React Hook Form instance
 * @param form The React Hook Form instance to validate
 * @param validatorId The DI identifier for the validator service
 * @returns Validation utilities for the form
 */
export function useValidator(
  validatorId: string,
  initialData: any,
  mode: 'onBlur' | 'onChange' | 'onSubmit' | 'all' = 'onSubmit',
  onValidated?: (data: any) => void,
) {
  // Get the validator service from DI
  const [values, setValues] = useState(initialData);
  const validator = getService<ValidationService>(validatorId);
  const schema = validator.getSchema();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: initialData,
    mode: mode,
  });

  if (onValidated) {
    // Set up subscription once and clean it up properly
    useEffect(() => {
      const unsubscribe = form.subscribe({
        formState: { isValid: true, isValidating: true },
        callback: (formState) => {
          if (formState.isValid && !formState.isValidating) {
            if (isEqual(values, form.getValues())) return;
            onValidated(form.getValues());
            setValues(form.getValues());
          }
        },
      });

      // Clean up subscription when component unmounts
      return () => unsubscribe();
    }, [form, onValidated]);
  }
  return {
    form,
    validator,
  };
}
