import { useForm } from 'react-hook-form';
import { ValidationService } from '@/platform/services/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { getService } from '@/lib/client/service';
import z from 'zod/v4';

/**
 * Hook for using a validation service with a React Hook Form instance
 * @param form The React Hook Form instance to validate
 * @param validatorId The DI identifier for the validator service
 * @returns Validation utilities for the form
 */
export function useValidator(
    validatorId: string,
    initialData: any,
    mode: 'onBlur' | 'onChange' | 'onSubmit' | 'all'
) {
    // Get the validator service from DI
    const validator = getService<ValidationService>(validatorId);
    const schema = validator.getSchema();
    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: initialData,
        mode: mode,
    });
    return {
        form,
        validator
    };
}