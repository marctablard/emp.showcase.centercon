import { injectable } from '@platform/core/di/injectable';
import { z } from 'zod';
import ZodSchemaValidationService from './ZodSchemaValidationService';

// Customer validation schema
export const ContactDataSchema = z.object({
  firstName: z.string().min(1, 'contactData.firstName.required'),
  lastName: z.string().min(1, 'contactData.lastName.required'),
  email: z.string().min(1, 'contactData.email.required').email('contactData.email.invalid'),
  phone: z.string().optional(),
  company: z.string().optional(),
});

@injectable('ContactDataValidationService', 'Singleton')
class EmporixContactDataValidationService extends ZodSchemaValidationService {
  constructor() {
    super(ContactDataSchema);
  }
}

export default EmporixContactDataValidationService;
