import { injectable } from '@platform/core/di/injectable';
import { z } from 'zod';
import ZodSchemaValidationService from './ZodSchemaValidationService';

const PaymentFormSchema = z.object({
  id: z.string().min(1, 'payment.id.required'),
});

@injectable('PaymentValidationService', 'Singleton')
class EmporixPaymentValidationService extends ZodSchemaValidationService {
  constructor() {
    super(PaymentFormSchema);
  }
}

export default EmporixPaymentValidationService;
