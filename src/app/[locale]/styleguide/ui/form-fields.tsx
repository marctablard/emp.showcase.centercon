'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, User } from 'lucide-react';
import z from 'zod';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Rating } from '@/components/ui/rating';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
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
  radio: z.enum(['all', 'mentions', 'none'], {
    required_error: 'You need to select a notification type.',
  }),
});

export default function FormFieldsSytelguideComponent() {
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
      checkboxes: ['home'],
    },
    mode: 'all',
  });

  const checkboxItems = [
    {
      id: 'recents',
      label: 'Recents',
    },
    {
      id: 'home',
      label: 'Home',
    },
    {
      id: 'applications',
      label: 'Applications',
    },
    {
      id: 'desktop',
      label: 'Desktop',
    },
  ] as const;

  const [value, setValue] = React.useState([30, 80]);
  const [valueDis, setValueDis] = React.useState([10, 90]);

  function onSubmit(data: z.infer<typeof FormSchemaValidate>) {
    console.log(JSON.stringify(data, null, 2));
  }

  return (
    <div className="flex flex-col gap-10 mb-50">
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
                    <FormControl>
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
                    <FormControl>
                      <Input placeholder="Username" endIcon={Eye} {...field} />
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
                    <FormControl>
                      <Input placeholder="Username" startIcon={User} {...field} />
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
                    <FormControl>
                      <Input placeholder="Username" startIcon={User} endIcon={Eye} {...field} />
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
                    <FormControl>
                      <Input placeholder="Username" startIcon={User} endIcon={Eye} disabled {...field} />
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
                      <FormControl>
                        <Input placeholder="Username" startIcon={User} endIcon={Eye} {...field} />
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
                        <FormControl>
                          <SelectTrigger startIcon={User}>
                            <SelectValue placeholder="Placeholder" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="nomail" startIcon={User} endIcon={Eye}>
                            No email
                          </SelectItem>
                          <SelectItem value="abc@google.com" startIcon={User} endIcon={Eye}>
                            abc@email.com
                          </SelectItem>
                          <SelectItem value="def@google.com" startIcon={User} endIcon={Eye}>
                            def@email.com
                          </SelectItem>
                          <SelectItem value="ghi@google.com" startIcon={User} endIcon={Eye}>
                            ghi@email.com
                          </SelectItem>
                          <SelectItem value="jkl@support.com" startIcon={User} endIcon={Eye}>
                            jkl@email.com
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-2">
                <FormField
                  control={formVal.control}
                  name="checkboxes"
                  render={() => (
                    <FormItem>
                      <FormLabel>Checkbox</FormLabel>
                      <FormDescription>Select the items you want</FormDescription>

                      {checkboxItems.map((item) => (
                        <FormField
                          key={item.id}
                          control={formVal.control}
                          name="checkboxes"
                          render={({ field }) => {
                            return (
                              <FormItem key={item.id} className="flex flex-row items-center gap-2">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, item.id])
                                        : field.onChange(field.value?.filter((value) => value !== item.id));
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">{item.label}</FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}

                      <FormField
                        key="indeterminate"
                        control={formVal.control}
                        name="checkboxes"
                        render={({ field }) => {
                          return (
                            <FormItem key="indeterminate" className="flex flex-row items-center gap-2">
                              <FormControl>
                                <Checkbox checked={'indeterminate'} />
                              </FormControl>
                              <FormLabel className="font-normal">Indeterminate</FormLabel>
                            </FormItem>
                          );
                        }}
                      />

                      <FormField
                        key="disabled"
                        control={formVal.control}
                        name="checkboxes"
                        render={({}) => {
                          return (
                            <FormItem key="disabled" className="flex flex-row items-center gap-2">
                              <FormControl>
                                <Checkbox disabled />
                              </FormControl>
                              <FormLabel className="font-normal">Disabled</FormLabel>
                            </FormItem>
                          );
                        }}
                      />

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-2">
                <FormField
                  control={formVal.control}
                  name="radio"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Radio Buttons</FormLabel>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col">
                        <FormItem className="flex items-center gap-3">
                          <FormControl>
                            <RadioGroupItem value="all" />
                          </FormControl>
                          <FormLabel className="font-normal">All new messages</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center gap-3">
                          <FormControl>
                            <RadioGroupItem value="mentions" />
                          </FormControl>
                          <FormLabel className="font-normal">Direct messages and mentions</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center gap-3">
                          <FormControl>
                            <RadioGroupItem value="none" />
                          </FormControl>
                          <FormLabel className="font-normal">Nothing</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center gap-3">
                          <FormControl>
                            <RadioGroupItem value="wrong" checked />
                          </FormControl>
                          <FormLabel className="font-normal">Wrong One</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center gap-3">
                          <FormControl>
                            <RadioGroupItem value="disabled" disabled />
                          </FormControl>
                          <FormLabel className="font-normal">Disabled</FormLabel>
                        </FormItem>
                      </RadioGroup>
                      <FormMessage />
                      <Button type="submit">Submit</Button>
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-2">
                <FormLabel>Slider</FormLabel>
                <div className="w-full max-w-sm mx-auto">
                  <div className="w-full flex items-center justify-between gap-2">
                    <Slider value={value} onValueChange={setValue} max={100} step={1} />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <FormLabel>Slider Disabled</FormLabel>
                <div className="w-full max-w-sm mx-auto">
                  <div className="w-full flex items-center justify-between gap-2">
                    <Slider value={valueDis} onValueChange={setValueDis} max={100} step={1} disabled />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <FormLabel>Rating</FormLabel>
                <Rating count={1}></Rating>
              </div>
              <div className="flex flex-col gap-2">
                <FormLabel>Color Filter</FormLabel>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
