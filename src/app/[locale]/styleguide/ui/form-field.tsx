'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, User } from 'lucide-react';
import z from 'zod';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ColorFilter } from '@/components/ui/color-filter';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input, InputButton } from '@/components/ui/input';
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
  button: z.string().optional(),
});

const FormSchemaValidate = z.object({
  input: z.string().min(3, { message: 'Error' }),
  textarea: z.string().optional(),
  select: z.string({ message: 'Error' }).email(),
  selectDisabled: z.string().optional(),
  checkboxes: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one item.',
  }),
});

const FormSchemaRadio = z.object({
  radio: z.enum(['all', 'mentions', 'none'], {
    required_error: 'You need to select a notification type.',
  }),
});

export default function FormFieldSytelguide() {
  const form = useForm<z.infer<typeof FormSchemaInput>>({
    resolver: zodResolver(FormSchemaInput),
    defaultValues: {
      noIcon: '',
      leftIcon: '',
      rightIcon: '',
      bothIcon: '',
      disabled: '',
      button: '',
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

  const formRadio = useForm<z.infer<typeof FormSchemaRadio>>({
    resolver: zodResolver(FormSchemaRadio),
    mode: 'all',
  });

  const tooltipText =
    'Message - Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua';

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

  function onSubmit(data: z.infer<typeof FormSchemaRadio>) {
    console.log(JSON.stringify(data, null, 2));
  }

  return (
    <div className="py-12">
      <h4 className="text-3xl/5 md:text-4xl font-bold text-headlines font-headlines mb-3">Form Elements</h4>
      <div className="flex flex-col gap-10 mb-50">
        <div className="flex flex-col gap-6">
          <h4>Label</h4>
          <div className="flex gap-10">
            <div className="flex flex-col gap-2">
              <Label hasTooltip tooltipText={tooltipText}>
                Label
              </Label>
            </div>
            <div className="flex flex-col gap-2">
              <Label isOptional hasTooltip tooltipText={tooltipText}>
                Label
              </Label>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h4>Default Input Fields</h4>
          <Form {...form}>
            <div className="flex flex-wrap gap-10">
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
              <div className="flex flex-col gap-2">
                <h5>Input Button</h5>
                <FormField
                  control={form.control}
                  name="button"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <InputButton
                          placeholder="Username"
                          startIcon={User}
                          endIcon={Eye}
                          buttonText="Test"
                          iconButtonAfter={User}
                          iconButtonBefore={User}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Form>
        </div>

        <div className="flex flex-col gap-6 w-full">
          <h4>Validatable Form Elements</h4>
          <div className="flex flex-col gap-10 md:flex-row">
            <div className="flex flex-col gap-10 w-full md:flex-row md:w-1/2">
              <Form {...formVal}>
                <form className="flex flex-col gap-10 w-full md:w-1/2">
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
                            <Textarea placeholder="Placeholder" maxLength={500} {...field} />
                          </FormControl>
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
                              <SelectItem value="jkl@support.com" startIcon={User} endIcon={Eye} disabled>
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
                      name="selectDisabled"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Field Disabled</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger startIcon={User} disabled>
                                <SelectValue placeholder="Placeholder" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="nomailDis" startIcon={User} endIcon={Eye}>
                                No email
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
                                    <Checkbox checked={'indeterminate'} {...field} />
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
                            render={({ field }) => {
                              return (
                                <FormItem key="disabled" className="flex flex-row items-center gap-2">
                                  <FormControl>
                                    <Checkbox disabled {...field} />
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
                </form>
              </Form>

              <Form {...formRadio}>
                <form className="flex flex-col gap-10 w-full md:w-1/2" onSubmit={formRadio.handleSubmit(onSubmit)}>
                  <div className="flex flex-col gap-2">
                    <FormField
                      control={formRadio.control}
                      name="radio"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Radio Buttons</FormLabel>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col"
                          >
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
                          <Button type="submit">Validate Radio</Button>
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            </div>
            <div className="flex flex-col gap-10 w-full md:flex-row md:w-1/2">
              <div className="flex flex-col gap-10 w-1/2">
                <div className="flex flex-col gap-5">
                  <div className="text-base font-bold">Slider</div>
                  <div className="w-full max-w-sm mx-auto">
                    <div className="w-full flex items-center justify-between gap-2">
                      <Slider value={value} onValueChange={setValue} max={100} step={1} />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-5">
                  <div className="text-base font-bold">Slider Disabled</div>
                  <div className="w-full max-w-sm mx-auto">
                    <div className="w-full flex items-center justify-between gap-2">
                      <Slider value={valueDis} onValueChange={setValueDis} max={100} step={1} disabled />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-base font-bold">Rating</div>
                  <Rating starsCount={5}></Rating>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-base font-bold">Rating Disabled</div>
                  <Rating starsCount={5} disabled></Rating>
                </div>
              </div>
              <div className="flex flex-col gap-10 w-1/2">
                <div className="flex flex-col gap-2">
                  <div className="text-base font-bold">Color Filter</div>
                  <ColorFilter className="bg-orange-700" color="Color 1" />
                  <ColorFilter className="bg-green-900" color="Color 2" />
                  <ColorFilter className="bg-red-400" color="Color 3" />
                  <ColorFilter className="bg-purple-400" color="Color 4" />
                  <ColorFilter className="bg-primary-500" color="Color 5" />
                  <ColorFilter className="bg-primary-500" color="Disabled" disabled />
                  <ColorFilter className="bg-primary-500" color="Disabled Checked" disabled checked />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
