'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { Instagram, Linkedin, Mail, Youtube } from 'lucide-react';
import { useNewsletterForm } from '@/hooks/newsletter/useNewsletterForm';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form';
import { InputButton } from '../ui/input';
import UiLink from '../ui/link';

export default function Footer() {
  const t = useTranslations('footer');
  const newsletterForm = useNewsletterForm();

  return (
    <footer className="w-full">
      <div className="text-sm grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 p-4 lg:p-6">
        <div>
          <p className="font-bold mb-2">{t('newsletterTitle')}</p>
          <div className="max-w-[560px]">
            <Form {...newsletterForm}>
              <form onSubmit={newsletterForm.handleSubmit(newsletterForm.onSubmit)}>
                <FormField
                  control={newsletterForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <InputButton placeholder={t('newsletterInput')} {...field} iconButtonAfter={Mail} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
          <p className="mt-2">
            {t('beforePrivacyPolicy')}
            <UiLink type="Link" variant="text" href="/privacy-policy">
              {t('privacyPolicyLink')}
            </UiLink>
            {t('beforeTermsAndConditions')}
            <UiLink type="Link" variant="text" href="/terms-and-conditions">
              {t('termsAndConditionsLink')}
            </UiLink>
            {t('afterTermsAndConditions')}
          </p>
        </div>
        <div>
          <p className="font-bold mb-2 md:mb-6">{t('paymentMethodsTitle')}</p>
          <div className="flex gap-2 justify-between items-center max-w-[400px]">
            <Image src="/images/mastercard.svg" alt="Mastercard" width="88" height="20" />
            <Image src="/images/visa.svg" alt="Visa" width="32" height="10" />
            <Image src="/images/paypal.svg" alt="Paypal" width="60" height="16" />
            <Image src="/images/pci-dss-compliant.svg" alt="PCI DSS Compliant" width="50" height="20" />
            <Image src="/images/gdpr.svg" alt="GDPR" width={19} height={24} />
          </div>
        </div>
        <div className="bg-primary-50 rounded-tl-2xl p-2 md:p-4">
          <div className="bg-[url('/map-pinned.svg')] bg-no-repeat bg-right-top">
            <p className="font-bold">{t('companyName')}</p>
            <p>{t('street')}</p>
            <p>{t('city')}</p>
            <p>{t('country')}</p>
          </div>
        </div>
        <div className="bg-primary-50 rounded-br-2xl p-2 md:p-4">
          <div className="bg-[url('/headset.svg')] bg-no-repeat bg-right-top flex flex-col gap-2">
            <div>
              <p className="font-bold">{t('ourServiceHours')}</p>
              <p>{t('mondayToThursday')}</p>
              <p>{t('friday')}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="font-bold">{t('serviceTechnology')}</p>
                <p>0123 987654-32</p>
              </div>
              <div>
                <p className="font-bold">{t('sales')}</p>
                <p>0123 987654-31</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function FooterLinks() {
  const t = useTranslations('footerLinks');

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 lg:gap-6 ml-4 mr-4 lg:ml-6 lg:mr-6 py-4 lg:py-6 border-b border-b-neutral-200">
      <div className="flex flex-col gap-1">
        <p className="text-xl mb-1">{t('products')}</p>
        <UiLink type="Link" href="#" variant="secondary" size="s">
          {t('solarPanels')}
        </UiLink>
        <UiLink type="Link" href="#" variant="secondary" size="s">
          {t('inverters')}
        </UiLink>
        <UiLink type="Link" href="#" variant="secondary" size="s">
          {t('batterySolutions')}
        </UiLink>
        <UiLink type="Link" href="#" variant="secondary" size="s">
          {t('wiringSolutions')}
        </UiLink>
        <UiLink type="Link" href="#" variant="secondary" size="s">
          {t('solarAccessories')}
        </UiLink>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-xl mb-1">{t('services')}</p>
        <UiLink type="Link" href="#" variant="secondary" size="s">
          {t('solarSolutions')}
        </UiLink>
        <UiLink type="Link" href="#" variant="secondary" size="s">
          {t('installations')}
        </UiLink>
        <UiLink type="Link" href="#" variant="secondary" size="s">
          {t('renewableEnergy')}
        </UiLink>
        <UiLink type="Link" href="#" variant="secondary" size="s">
          {t('techServices')}
        </UiLink>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-xl mb-1">{t('solutions')}</p>
        <UiLink type="Link" href="#" variant="secondary" size="s">
          {t('installationPlanning')}
        </UiLink>
        <UiLink type="Link" href="#" variant="secondary" size="s">
          {t('regularMaintenance')}
        </UiLink>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-xl mb-1">{t('onlinePlanner')}</p>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-xl mb-1">{t('aboutUs')}</p>
        <UiLink type="Link" href="#" variant="secondary" size="s">
          <Linkedin />
          Linkedin
        </UiLink>
        <UiLink type="Link" href="#" variant="secondary" size="s">
          <Youtube />
          Youtube
        </UiLink>
        <UiLink type="Link" href="#" variant="secondary" size="s">
          <Instagram />
          Instagram
        </UiLink>
      </div>
    </div>
  );
}

export function FooterWrapper({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="footer"
      className={cn('max-w-6xl mx-auto ml-4 mr-4 lg:ml-9 lg:mr-9 shadow-footer', className)}
      {...props}
    />
  );
}

export function LegalFooter() {
  const t = useTranslations('footerLegal');

  return (
    <div
      data-slot="legal-footer"
      className="max-w-6xl w-full mx-auto px-4 pb-16 pt-2 md:px-8 md:py-0 md:h-8 bg-primary-500 md:rounded-full"
    >
      <div className="flex flex-col md:flex-row gap-2 lg:gap-6 flex-wrap text-sm/8 text-white">
        <p className="flex-grow text-center md:text-left">{t('copyright')}</p>
        <div className="flex flex-grow gap-6 justify-between md:justify-end">
          <Link
            href="/privacy-policy"
            className="hover:underline outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            {t('privacyPolicy')}
          </Link>
          <Link
            href="/imprint"
            className="hover:underline outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            {t('imprint')}
          </Link>
          <Link
            href="/terms-and-conditions"
            className="hover:underline outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            {t('termsAndConditions')}
          </Link>
        </div>
      </div>
    </div>
  );
}
