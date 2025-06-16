/**
 * Interface for validation service
 */
export interface ValidationService {
  /**
   * Validate the data against the schema
   * @param data The data to validate
   * @returns Validation result with success flag and errors if any
   */
  validate<T>(data: T): ValidationResult<T>;

  /**
   * Get the validation schema
   * @returns The validation schema
   */
  getSchema(): z.ZodTypeAny;
}
