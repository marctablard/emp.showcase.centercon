'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, User } from 'lucide-react';
import z from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const FormSchema = z.object({
  noIcon: z.string().min(2, {
    message: 'Username must be at least 2 characters.',
  }),
  leftIcon: z.string().min(2, {
    message: 'Username must be at least 2 characters.',
  }),
  rightIcon: z.string().min(2, {
    message: 'Username must be at least 2 characters.',
  }),
  bothIcon: z.string().min(2, {
    message: 'Username must be at least 2 characters.',
  }),
  disabled: z.string(),
});

export default function FormFieldsSytelguideComponent() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      noIcon: '',
      leftIcon: '',
      rightIcon: '',
      bothIcon: '',
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(JSON.stringify(data, null, 2));
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-6">
        <h4>Label</h4>
        <div className="flex gap-10">
          <div className="flex flex-col gap-2">
            <Label>Label</Label>
          </div>
          <div className="flex flex-col gap-2">
            <Label isOptional>Label</Label>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h4>Default Input Field</h4>
        <div className="flex gap-10">
          <div className="flex flex-col gap-2">
            <h5>No Icon</h5>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
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
              </form>
            </Form>
          </div>
          <div className="flex flex-col gap-2">
            <h5>Icon right</h5>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name="rightIcon"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl endIcon={Eye}>
                        <Input placeholder="Username" spaceEnd {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
          <div className="flex flex-col gap-2">
            <h5>Icon left</h5>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name="leftIcon"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl startIcon={User}>
                        <Input placeholder="Username" spaceStart {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
          <div className="flex flex-col gap-2">
            <h5>Icon left and right</h5>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name="bothIcon"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl startIcon={User} endIcon={Eye}>
                        <Input placeholder="Username" spaceStart spaceEnd {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <h4>Diabled Input Field</h4>
        <div className="flex gap-10">
          <div className="flex flex-col gap-2">
            <h5>No Icon</h5>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name="disabled"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Username" disabled {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
          <div className="flex flex-col gap-2">
            <h5>Icon right</h5>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name="disabled"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl endIcon={Eye}>
                        <Input placeholder="Username" spaceEnd disabled {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
          <div className="flex flex-col gap-2">
            <h5>Icon left</h5>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name="disabled"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl startIcon={User}>
                        <Input placeholder="Username" spaceStart disabled {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
          <div className="flex flex-col gap-2">
            <h5>Icon left and right</h5>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name="disabled"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl startIcon={User} endIcon={Eye}>
                        <Input placeholder="Username" spaceStart spaceEnd disabled {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
