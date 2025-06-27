import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, User } from 'lucide-react';
import z from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

function SearchSort() {
  const FormSchemaInput = z.object({
    select: z.string().optional(),
  });

  const form = useForm<z.infer<typeof FormSchemaInput>>({
    resolver: zodResolver(FormSchemaInput),
    defaultValues: {
      select: 'low',
    },
  });
  return (
    <Form {...form}>
      <FormField
        name="select"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger startIcon={User}>
                  <SelectValue placeholder="Placeholder" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="low" startIcon={User} endIcon={Eye}>
                  Price, low to high
                </SelectItem>
                <SelectItem value="high" startIcon={User} endIcon={Eye}>
                  Price, high to low
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </Form>
  );
}

export { SearchSort };
