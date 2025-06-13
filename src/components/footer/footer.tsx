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
          <p className="font-bold mb-2">Join Our Newsletter for Exclusive Updates and More!</p>
          <div className="max-w-[560px]">
            <Form {...newsletterForm}>
              <form onSubmit={newsletterForm.handleSubmit(newsletterForm.onSubmit)}>
                <FormField
                  control={newsletterForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <InputButton placeholder="Email address" {...field} iconButtonAfter={Mail} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
          <p className="mt-2">
            I have acknowledged the{' '}
            <UiLink type="Link" variant="text" href="/privacy-policy">
              privacy policy
            </UiLink>{' '}
            and read the{' '}
            <UiLink type="Link" variant="text" href="/terms-and-conditions">
              terms and conditions
            </UiLink>
            , and I agree with them.
          </p>
        </div>
        <div>
          <p className="font-bold mb-2 md:mb-6">Every purchase easily paid and secured.</p>
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
              <p className="font-bold">Our service hours</p>
              <p>Monday to Thursday: 8:00 AM to 5:00 PM</p>
              <p>Friday: 8:00 AM to 2:00 PM</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="font-bold">Service & Technology</p>
                <p>0123 987654-32</p>
              </div>
              <div>
                <p className="font-bold">Sales</p>
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
  // this content will be customizable from storyblok later so no frontend translations are needed
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 lg:gap-6 ml-4 mr-4 lg:ml-6 lg:mr-6 py-4 lg:py-6 border-b border-b-neutral-200">
      <div className="flex flex-col gap-1">
        <p className="text-xl mb-1">Products</p>
        <UiLink type="Link" href="#" variant="secondary" size="s">
          Solar Panels
        </UiLink>
        <UiLink type="Link" href="#" variant="secondary" size="s">
          Inverters
        </UiLink>
        <UiLink type="Link" href="#" variant="secondary" size="s">
          Battery Solutions
        </UiLink>
        <UiLink type="Link" href="#" variant="secondary" size="s">
          Wiring Solutions
        </UiLink>
        <UiLink type="Link" href="#" variant="secondary" size="s">
          Solar Accessories
        </UiLink>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-xl mb-1">Services</p>
        <UiLink type="Link" href="#" variant="secondary" size="s">
          Solar Solutions
        </UiLink>
        <UiLink type="Link" href="#" variant="secondary" size="s">
          Installations
        </UiLink>
        <UiLink type="Link" href="#" variant="secondary" size="s">
          Renewable Energy
        </UiLink>
        <UiLink type="Link" href="#" variant="secondary" size="s">
          Tech Services
        </UiLink>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-xl mb-1">Solutions</p>
        <UiLink type="Link" href="#" variant="secondary" size="s">
          Installation planning
        </UiLink>
        <UiLink type="Link" href="#" variant="secondary" size="s">
          Regular maintenance
        </UiLink>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-xl mb-1">Online Planner</p>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-xl mb-1">About us</p>
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
  // this content will be customizable from storyblok later so no frontend translations are needed
  return (
    <div
      data-slot="legal-footer"
      className="max-w-6xl w-full mx-auto px-4 pb-16 pt-2 md:px-8 md:py-0 md:h-8 bg-primary-500 md:rounded-full"
    >
      <div className="flex flex-col md:flex-row gap-2 lg:gap-6 flex-wrap text-sm/8 text-white">
        <p className="flex-grow text-center md:text-left">© 2025 Emporix. All Rights Reserved.</p>
        <div className="flex flex-grow gap-6 justify-between md:justify-end">
          <Link
            href="#"
            className="hover:underline outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Privacy Policy
          </Link>
          <Link
            href="#"
            className="hover:underline outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Imprint
          </Link>
          <Link
            href="#"
            className="hover:underline outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Terms and Conditions
          </Link>
        </div>
      </div>
    </div>
  );
}
