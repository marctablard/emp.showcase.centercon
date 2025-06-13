import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export const NewsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export function useNewsletterForm() {
  const methods = useForm({
    resolver: zodResolver(NewsletterSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = (data: any) => {
    console.log('newsletter registration successful for this mail: ', data);
  };

  return {
    ...methods,
    onSubmit,
  };
}
