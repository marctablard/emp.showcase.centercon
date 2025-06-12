'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { Instagram, Linkedin, Youtube } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Footer() {
  const t = useTranslations('footer');
  return (
    <footer className="w-full">
      <div className="text-sm grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 p-4 lg:p-6">
        <div>
          <p className="font-bold mb-2">Join Our Newsletter for Exclusive Updates and More!</p>
          <p>I have acknowledged the privacy policy and read the terms and conditions, and I agree with them.</p>
        </div>
        <div>
          <p className="font-bold mb-2 md:mb-6">Every purchase easily paid and secured.</p>
          <div className="flex gap-2 justify-between items-center max-w-[400px]">
            <Image src="mastercard.svg" alt="Mastercard" width="88" height="20" />
            <Image src="visa.svg" alt="Visa" width="32" height="10" />
            <Image src="paypal.svg" alt="Paypal" width="60" height="16" />
            <Image src="pci-dss-compliant.svg" alt="PCI DSS Compliant" width="50" height="20" />
            <Image src="gdpr.svg" alt="GDPR" width="19" height="24" />
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
        <Link
          href="#"
          className="text-sm inline-flex items-center gap-1 hover:underline hover:text-primary-500 outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          Solar Panels
        </Link>
        <Link
          href="#"
          className="text-sm inline-flex items-center gap-1 hover:underline hover:text-primary-500 outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          Inverters
        </Link>
        <Link
          href="#"
          className="text-sm inline-flex items-center gap-1 hover:underline hover:text-primary-500 outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          Battery Solutions
        </Link>
        <Link
          href="#"
          className="text-sm inline-flex items-center gap-1 hover:underline hover:text-primary-500 outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          Wiring Solutions
        </Link>
        <Link
          href="#"
          className="text-sm inline-flex items-center gap-1 hover:underline hover:text-primary-500 outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          Solar Accessories
        </Link>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-xl mb-1">Services</p>
        <Link
          href="#"
          className="text-sm inline-flex items-center gap-1 hover:underline hover:text-primary-500 outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          Solar Solutions
        </Link>
        <Link
          href="#"
          className="text-sm inline-flex items-center gap-1 hover:underline hover:text-primary-500 outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          Installations
        </Link>
        <Link
          href="#"
          className="text-sm inline-flex items-center gap-1 hover:underline hover:text-primary-500 outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          Renewable Energy
        </Link>
        <Link
          href="#"
          className="text-sm inline-flex items-center gap-1 hover:underline hover:text-primary-500 outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          Tech Services
        </Link>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-xl mb-1">Solutions</p>
        <Link
          href="#"
          className="text-sm inline-flex items-center gap-1 hover:underline hover:text-primary-500 outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          Installation planning
        </Link>
        <Link
          href="#"
          className="text-sm inline-flex items-center gap-1 hover:underline hover:text-primary-500 outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          Regular maintenance
        </Link>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-xl mb-1">Online Planner</p>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-xl mb-1">About us</p>
        <Link
          href="#"
          className="text-sm inline-flex items-center gap-1 hover:underline hover:text-primary-500 outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          <Linkedin />
          Linkedin
        </Link>
        <Link
          href="#"
          className="text-sm inline-flex items-center gap-1 hover:underline hover:text-primary-500 outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          <Youtube />
          Youtube
        </Link>
        <Link
          href="#"
          className="text-sm inline-flex items-center gap-1 hover:underline hover:text-primary-500 outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          <Instagram />
          Instagram
        </Link>
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
