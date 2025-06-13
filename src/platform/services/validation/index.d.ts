export * from './ValidationService';

/**
 * Types for validation results
 */
export type ValidationResult<T> = {
    success: boolean;
    errors?: Record<string, string>;
    data?: T;
};

