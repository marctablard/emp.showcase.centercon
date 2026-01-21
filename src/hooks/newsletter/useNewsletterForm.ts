import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getLogger } from '@/lib/logger/use-logger-client';

export const NewsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export function useNewsletterForm() {
  const form = useForm({
    resolver: zodResolver(NewsletterSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = (data: any) => {
    getLogger().info({ data }, 'newsletter registration successful for this mail');
  };

  return {
    form,
    onSubmit,
  };
}
