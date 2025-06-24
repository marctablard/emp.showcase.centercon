'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { H4, H5 } from '@/components/ui/h';
import UiLink from '@/components/ui/link';
import { useRegistration } from '@/hooks/registration/useRegistration';
import useCurrency from '@/hooks/useCurrency';
import { useValidator } from '@/hooks/validation/useValidator';
import { RegistrationData } from '@/platform/services/validation/impl/EmporixRegistrationValidationService';
import LoginDialog from '../login/login-dialog';
import { AccountSettingsSection } from './account-settings-section';
import { AddressInfoSection } from './address-info-section';
import { EmailSignupSection } from './email-signup-section';
import { RegistrationInfoSection } from './registration-info-section';

export default function Registration() {
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

  // Use the validator hook with the RegistrationValidationService
  const { form } = useValidator(
    'RegistrationValidationService',
    {
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
      password: '',
      passwordConfirmation: '',
      additionalInformation: '',
      newsletter: false,
      dealsAlerts: false,
    },
    'onBlur',
  );

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
        // Redirect to login page or show a success message
        router.push('/login');
      } else if (result.error) {
        // Handle specific error types
        // Todo: Check below cases if they exist
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
    <div className="w-full max-w-228 px-6 pb-8 flex flex-col gap-8" ref={top}>
      <div className="flex flex-col gap-2">
        <H4>{t('title')}</H4>
        <p>
          {t('alreadyHaveAccount')}{' '}
          <LoginDialog redirectAfterLogin={true} trigger={<UiLink type="Button">{t('logIn')}</UiLink>} />
        </p>
      </div>

      <Form {...form}>
        <form id="register-form" onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
          {(formError || error) && (
            <div className="flex flex-col gap-2">
              <H5 className="text-danger-500">{t('error')}</H5>
              <span className="text-danger-500">{formError || error}</span>
            </div>
          )}

          <RegistrationInfoSection number={1} control={form.control} />
          <AddressInfoSection number={2} control={form.control} />
          <AccountSettingsSection number={3} control={form.control} />
          {/* Todo: Add additional information section */}
          {/*<AdditionalInformationSection number={4} control={form.control} />*/}
          <EmailSignupSection number={4} control={form.control} />
        </form>
      </Form>

      <div className="flex flex-col items-start gap-6">
        <p>
          {t.rich('termsNotice', {
            privacyPolicy: (chunks) => (
              <UiLink type="Link" href="/#">
                {chunks}
              </UiLink>
            ), // Todo set correct link
            termsOfUse: (chunks) => (
              <UiLink type="Link" href="/#">
                {chunks}
              </UiLink>
            ), // Todo: set correct link
          })}
        </p>
        <Button type="submit" form="register-form" className="w-full" disabled={loading}>
          {loading ? t('registering') : t('registerButton')}
        </Button>
      </div>
    </div>
  );
}
