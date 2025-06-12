'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Instagram, Linkedin, Youtube } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Footer() {
  const t = useTranslations('footer');
  return (
    <footer className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 p-4 lg:p-6">
        <div className="text-sm bg-primary-50 rounded-tl-2xl p-2 md:p-4">
          <div className="font-bold">{t('companyName')}</div>
          <div>{t('street')}</div>
          <div>{t('city')}</div>
          <div>{t('country')}</div>
        </div>
        <div className="text-sm bg-primary-50 rounded-br-2xl p-2 md:p-4 flex flex-col gap-2">
          <div>
            <div className="font-bold">Our service hours</div>
            <div>Monday to Thursday: 8:00 AM to 5:00 PM</div>
            <div>Friday: 8:00 AM to 2:00 PM</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="font-bold">Service & Technology</div>
              <div>0123 987654-32</div>
            </div>
            <div>
              <div className="font-bold">Sales</div>
              <div>0123 987654-31</div>
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
      <div className="flex gap-2 lg:gap-6 flex-wrap text-sm/8 text-white">
        <p className="flex-grow">© 2025 Emporix. All Rights Reserved.</p>
        <div className="flex gap-6">
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
