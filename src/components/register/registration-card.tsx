'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import { z } from 'zod';
import { Accordion } from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { useRegistration } from '@/hooks/registration/useRegistration';
import useCurrency from '@/hooks/useCurrency';
import { Link } from '@/i18n/navigation';
import { AccountSettingsAccordion } from './account-settings-accordion';
import { AddressInfoAccordion } from './address-info-accordion';
import { EmailSignupSection } from './email-signup-section';
import { RegistrationInfoAccordion } from './registration-info-accordion';

export default function RegistrationCard() {
  const t = useTranslations('register');
  const router = useRouter();
  const { register, loading, error } = useRegistration();
  const [formError, setFormError] = useState<string | null>(null);
  const top = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const { currency } = useCurrency();
  useEffect(() => {
    if (formError && top.current) {
      top.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [formError]);

  const registrationData = z
    .object({
      registrationType: z.string().min(1, { message: t('validation.registrationTypeRequired') }),
      firstName: z.string().min(1, { message: t('validation.firstNameRequired') }),
      lastName: z.string().min(1, { message: t('validation.lastNameRequired') }),
      email: z.string().email({ message: t('validation.invalidEmail') }),
      emailConfirmation: z.string().email({ message: t('validation.invalidEmail') }),
      companyName: z.string().optional(),
      businessType: z.string().optional(),
      street: z.string().min(1, { message: t('validation.streetRequired') }),
      houseNumber: z.string().min(1, { message: t('validation.houseNumberRequired') }),
      postalCode: z.string().min(1, { message: t('validation.postalCodeRequired') }),
      city: z.string().min(1, { message: t('validation.cityRequired') }),
      country: z.string().min(1, { message: t('validation.countryRequired') }),
      vatNumber: z.string().optional(),
      shippingSameAsBilling: z.boolean(),
      username: z.string().min(3, { message: t('validation.usernameMinLength') }),
      password: z
        .string()
        .min(8, { message: t('validation.passwordMinLength') })
        .regex(/[A-Z]/, { message: t('validation.passwordUppercase') })
        .regex(/[a-z]/, { message: t('validation.passwordLowercase') })
        .regex(/[0-9]/, { message: t('validation.passwordNumber') }),
      passwordConfirmation: z.string().min(1, { message: t('validation.confirmPassword') }),
      newsletter: z.boolean(),
      dealsAlerts: z.boolean(),
    })
    .required({
      registrationType: true,
      firstName: true,
      lastName: true,
      email: true,
      emailConfirmation: true,
      street: true,
      houseNumber: true,
      postalCode: true,
      city: true,
      country: true,
      username: true,
      password: true,
      passwordConfirmation: true,
    })
    .refine((data) => data.email === data.emailConfirmation, {
      message: t('validation.emailMismatch'),
      path: ['emailConfirmation'],
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      message: t('validation.passwordMismatch'),
      path: ['passwordConfirmation'],
    });

  type RegistrationData = z.infer<typeof registrationData>;

  const form = useForm<RegistrationData>({
    resolver: zodResolver(registrationData),
    defaultValues: {
      registrationType: '',
      firstName: '',
      lastName: '',
      email: '',
      emailConfirmation: '',
      companyName: '',
      businessType: '',
      street: '',
      houseNumber: '',
      postalCode: '',
      city: '',
      country: '',
      vatNumber: '',
      shippingSameAsBilling: true,
      username: '',
      password: '',
      passwordConfirmation: '',
      newsletter: false,
      dealsAlerts: false,
    },
    mode: 'onBlur',
  });

  async function onSubmit(values: RegistrationData) {
    setFormError(null);

    try {
      const result = await register({
        credentials: {
          username: values.email,
          password: values.password,
        },
        customer: {
          email: values.email,
          firstName: values.firstName,
          lastName: values.lastName,
          company: values.companyName,
          language: locale, // use current locale
          currency: currency?.code, // use current currency
        },
        address: {
          contactName: values.firstName + ' ' + values.lastName,
          street: values.street,
          streetNumber: values.houseNumber,
          city: values.city,
          zipCode: values.postalCode,
          country: values.country,
          types: ['SHIPPING', 'BILLING'],
        },
      });

      if (result.success) {
        // Redirect to login page or show success message
        router.push('/login');
      } else if (result.error) {
        // Handle specific error types
        switch (result.error) {
          case 'USERNAME_TAKEN':
            setFormError(t('validation.usernameTaken'));
            break;
          case 'EMAIL_EXISTS':
            setFormError(t('validation.emailExists'));
            break;
          case 'SERVER_ERROR':
            setFormError(t('validation.serverError'));
            break;
          default:
            setFormError(t('validation.registrationFailed'));
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setFormError(t('validation.registrationFailed'));
    }
  }

  return (
    <Card className="w-full sm:w-[584px] sm:my-[104px] sm:rounded-xl sm:border sm:shadow-sm rounded-none border-0 shadow-none gap-16">
      <CardHeader className="gap-0" ref={top}>
        <CardTitle>
          <h3>{t('title')}</h3>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form id="register-form" onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-12">
            {(formError || error) && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formError || error}</AlertDescription>
              </Alert>
            )}

            <Accordion type="multiple" className="flex flex-col gap-12" defaultValue={['registration-info']}>
              <RegistrationInfoAccordion control={form.control} />
              <AddressInfoAccordion control={form.control} />
              <AccountSettingsAccordion control={form.control} />
            </Accordion>

            <EmailSignupSection control={form.control} />
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-6">
        <p>
          {t.rich('termsNotice', {
            privacyPolicy: (chunks) => <Link href="/">{chunks}</Link>, // Todo set correct link
            termsOfUse: (chunks) => <Link href="/">{chunks}</Link>, // Todo: set correct link
          })}
        </p>
        <Button type="submit" form="register-form" className="w-full" disabled={loading}>
          {loading ? t('registering') : t('registerButton')}
        </Button>
        <p>
          {t('alreadyHaveAccount')} <Link href="/login">{t('logIn')}</Link>
        </p>
      </CardFooter>
    </Card>
  );
}
