'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Bot, CheckCircle2, ClipboardCheck, HandHelping, LineChart, Package, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heading } from '@/components/ui/h';
import useAuthDialog from '@/hooks/authentication/useAuthDialog';

const benefits = [
  {
    icon: Package,
    key: 'trackOrders',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Bot,
    key: 'aiAssistant',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    icon: HandHelping,
    key: 'supportTickets',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    icon: Percent,
    key: 'quotes',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    icon: ClipboardCheck,
    key: 'approvals',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
  {
    icon: LineChart,
    key: 'insights',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
  },
];

export function AccountLanding() {
  const t = useTranslations('account.landing');
  const { openDialog } = useAuthDialog();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12">
      {/* Hero Section */}
      <div className="text-center mb-12 md:mb-16">
        <Heading variant="h1" className="mb-4">
          {t('title')}
        </Heading>
        <p className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto">{t('subtitle')}</p>
      </div>
      {/* CTA Section */}
      <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8 md:p-12 text-center">
        <Heading variant="h3" className="mb-6">
          {t('cta.registerSubtext')}
        </Heading>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button onClick={() => openDialog('login')} className="w-full sm:w-auto min-w-[200px] px-6 py-4">
            <CheckCircle2 className="mr-2 h-5 w-5" />
            {t('cta.login')}
          </Button>
          <Link href="/register" className="w-full sm:w-auto">
            <Button variant="secondary" className="w-full min-w-[200px] px-6 py-4">
              {t('cta.register')}
            </Button>
          </Link>
        </div>
      </div>
      {/* Benefits Grid */}
      <div className="mb-12 md:mb-16">
        <Heading variant="h2" className="text-center mb-8 md:mb-12">
          {t('benefits.title')}
        </Heading>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map(({ icon: Icon, key, color, bgColor }) => (
            <Card key={key} className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${bgColor} flex items-center justify-center mb-4`}>
                  <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <CardTitle className="text-xl">{t(`benefits.${key}.title`)}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{t(`benefits.${key}.description`)}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
