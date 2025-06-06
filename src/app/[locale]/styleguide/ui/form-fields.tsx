'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, User } from 'lucide-react';
import z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormIcon,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const FormSchemaInput = z.object({
  noIcon: z.string().optional(),
  leftIcon: z.string().optional(),
  rightIcon: z.string().optional(),
  bothIcon: z.string().optional(),
  disabled: z.string().optional(),
});

const FormSchemaValidate = z.object({
  input: z.string().min(3, { message: 'Error' }),
  textarea: z.string().optional(),
  select: z.string({ message: 'Error' }).email(),
  checkboxes: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one item.',
  }),
});

export default function FormFieldsSytelguideComponent() {
  const [disabled, setDisabled] = useState(false);

  const form = useForm<z.infer<typeof FormSchemaInput>>({
    resolver: zodResolver(FormSchemaInput),
    defaultValues: {
      noIcon: '',
      leftIcon: '',
      rightIcon: '',
      bothIcon: '',
      disabled: '',
    },
  });

  const formVal = useForm<z.infer<typeof FormSchemaValidate>>({
    resolver: zodResolver(FormSchemaValidate),
    defaultValues: {
      input: '',
      textarea: '',
      select: '',
      checkboxes: ['recents'],
    },
    mode: 'all',
  });

  function onSubmit(data: z.infer<typeof FormSchemaValidate>) {
    console.log(JSON.stringify(data, null, 2));
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-6">
        <h4>Label</h4>
        <div className="flex gap-10">
          <div className="flex flex-col gap-2">
            <Label hasTooltip>Label</Label>
          </div>
          <div className="flex flex-col gap-2">
            <Label isOptional hasTooltip>
              Label
            </Label>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h4>Default Input Fields</h4>
        <Form {...form}>
          <div className="flex gap-10">
            <div className="flex flex-col gap-2">
              <h5>No Icon</h5>
              <FormField
                control={form.control}
                name="noIcon"
                render={({ field }) => (
                  <FormItem>
                    <FormControl validate>
                      <Input placeholder="Username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col gap-2">
              <h5>Icon right</h5>
              <FormField
                control={form.control}
                name="rightIcon"
                render={({ field }) => (
                  <FormItem>
                    <FormControl validate endIcon={Eye}>
                      <Input placeholder="Username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col gap-2">
              <h5>Icon left</h5>
              <FormField
                control={form.control}
                name="leftIcon"
                render={({ field }) => (
                  <FormItem>
                    <FormControl validate startIcon={User}>
                      <Input placeholder="Username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col gap-2">
              <h5>Icon left and right</h5>
              <FormField
                control={form.control}
                name="bothIcon"
                render={({ field }) => (
                  <FormItem>
                    <FormControl validate startIcon={User} endIcon={Eye}>
                      <Input placeholder="Username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col gap-2">
              <h5>Disabled</h5>
              <FormField
                control={form.control}
                name="disabled"
                render={({ field }) => (
                  <FormItem>
                    <FormControl validate startIcon={User} endIcon={Eye}>
                      <Input placeholder="Username" disabled {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </Form>
      </div>

      <div className="flex flex-col gap-6">
        <h4>Validate Input Fields</h4>
        <div className="flex">
          <Form {...formVal}>
            <form onSubmit={formVal.handleSubmit(onSubmit)} className="flex flex-col gap-10">
              <div className="flex flex-col gap-2">
                <FormField
                  control={formVal.control}
                  name="input"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Input Field</FormLabel>
                      <FormDescription>Username must be at least 3 characters.</FormDescription>
                      <FormControl validate startIcon={User} endIcon={Eye}>
                        <Input placeholder="Username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-2">
                <FormField
                  control={formVal.control}
                  name="textarea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Textarea</FormLabel>
                      <FormDescription>Hint Text</FormDescription>
                      <FormControl>
                        <Textarea placeholder="Placeholder" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-2">
                <FormField
                  control={formVal.control}
                  name="select"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Field</FormLabel>
                      <FormDescription>Username must be at least 3 characters.</FormDescription>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl isDropdown>
                          <SelectTrigger>
                            <SelectValue placeholder="Placeholder" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <FormIcon startIcon={User}>
                            {' '}
                            <SelectItem value="mexample.com">No email</SelectItem>
                          </FormIcon>
                          <SelectItem value="m@google.com">m@email.com</SelectItem>
                          <SelectItem value="m@support.com">m@email.com</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/*   <div className="flex flex-col gap-2">
                                <FormField
                                    control={formVal.control}
                                    name="checkboxes"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel>Checkbox</FormLabel>
                                            <FormDescription>Select the items you want</FormDescription>

                                            <FormField
                                                key="house"
                                                control={form.control}
                                                name="checkboxes"
                                                render={({ field }) => {
                                                    return (
                                                        <FormItem
                                                            key="house"
                                                            className="flex flex-row items-center gap-2"
                                                        >
                                                            <FormControl>
                                                                <Checkbox checked />
                                                            </FormControl>
                                                        </FormItem>
                                                    )
                                                }
                                            }
                                                        />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div> */}
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
