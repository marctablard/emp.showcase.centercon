import { injectable } from '@platform/core/di/injectable';
import { z } from 'zod';
import ZodSchemaValidationService from './ZodSchemaValidationService';

const SummaryFormSchema = z.object({
  termsAndConditions: z.boolean(),
});

@injectable('SummaryValidationService', 'Singleton')
class DefaultSummaryValidationService extends ZodSchemaValidationService {
  constructor() {
    super(SummaryFormSchema);
  }
}

export default DefaultSummaryValidationService;
