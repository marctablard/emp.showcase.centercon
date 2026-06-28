'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Building2, MapPin, Pencil } from 'lucide-react';
import { AddressDisplay } from '@/components/common/address-display';
import { Badge, type BadgeVariant } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useCompanyDetails } from '@/hooks/company/useCompanyDetails';
import useCustomer from '@/hooks/customer/useCustomer';
import { useToast } from '@/hooks/ui/useToast';
import { Link } from '@/i18n/navigation';
import { getLogger } from '@/lib/logger/use-logger-client';
import type { CompanyDetails as CompanyDetailsModel } from '@/platform/services/model/company/company';
import { CustomerRole } from '@/platform/services/model/customer/roles';

type CompanyFormState = {
  name: string;
  legalName: string;
  taxRegistrationNumber: string;
  registrationId: string;
  registrationAgency: string;
  countryOfRegistration: string;
};

const ONBOARDING_BADGE: Record<'approved' | 'pending' | 'rejected', BadgeVariant> = {
  approved: 'success',
  pending: 'warning',
  rejected: 'destructive',
};

function toFormState(company: CompanyDetailsModel): CompanyFormState {
  return {
    name: company.name ?? '',
    legalName: company.legalInfo?.legalName ?? '',
    taxRegistrationNumber: company.legalInfo?.taxRegistrationNumber ?? '',
    registrationId: company.legalInfo?.registrationId ?? '',
    registrationAgency: company.legalInfo?.registrationAgency ?? '',
    countryOfRegistration: company.legalInfo?.countryOfRegistration ?? '',
  };
}

export function CompanyDetails() {
  const t = useTranslations('account.Company');
  const { toast } = useToast();
  const { company, loading, error, fetchCompany, updateCompany } = useCompanyDetails();
  const { customer } = useCustomer();

  const isAdmin = !!customer?.roles?.includes(CustomerRole.B2B_ADMIN);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<CompanyFormState | null>(null);

  useEffect(() => {
    if (company) {
      setForm(toFormState(company));
    }
  }, [company]);

  const setField = (key: keyof CompanyFormState, value: string) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  const handleSave = async () => {
    if (!form) {
      return;
    }
    setIsSaving(true);
    try {
      await updateCompany({
        name: form.name.trim(),
        legalInfo: {
          legalName: form.legalName.trim() || undefined,
          taxRegistrationNumber: form.taxRegistrationNumber.trim() || undefined,
          registrationId: form.registrationId.trim() || undefined,
          registrationAgency: form.registrationAgency.trim() || undefined,
          countryOfRegistration: form.countryOfRegistration.trim() || undefined,
        },
      });
      toast({ title: t('updateSuccessTitle'), description: t('updateSuccess'), variant: 'success' });
      setIsEditing(false);
    } catch (err) {
      getLogger().error({ err }, 'Failed to update company');
      toast({ title: t('error'), description: t('updateError'), variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && !company) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-text-error">{t('errorLoading')}</p>
        <Button variant="secondary" onClick={() => fetchCompany()} className="mt-4">
          {t('tryAgain')}
        </Button>
      </div>
    );
  }

  if (!company || !form) {
    return (
      <div className="text-center py-12">
        <Building2 className="mx-auto h-12 w-12 text-text-placeholders mb-4" />
        <p className="text-text-placeholders">{t('noCompany')}</p>
      </div>
    );
  }

  const readField = (label: string, value?: string | null) => (
    <div className="space-y-1">
      <p className="text-sm text-text-placeholders">{label}</p>
      <p className="font-medium break-words">{value && value.trim() !== '' ? value : '—'}</p>
    </div>
  );

  return (
    <div className="grid gap-8">
      {/* General information */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>{t('generalInfo')}</CardTitle>
            <div className="flex items-center gap-2">
              {company.onboarding && (
                <Badge variant={ONBOARDING_BADGE[company.onboarding.status]} rounded="default">
                  {t(`status.${company.onboarding.status}`)}
                </Badge>
              )}
              {isAdmin && !isEditing && (
                <Button variant="secondary" size="small" onClick={() => setIsEditing(true)} data-testid="company-edit">
                  <Pencil className="mr-2 h-4 w-4" />
                  {t('edit')}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {company.type === 'SUBSIDIARY' && <p className="text-sm text-text-placeholders">{t('subsidiaryNote')}</p>}

          {isEditing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="company-name">{t('companyName')}</Label>
                <Input id="company-name" value={form.name} onChange={(e) => setField('name', e.target.value)} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {readField(t('companyName'), company.name)}
              {readField(t('type'), company.type ? t(`types.${company.type}`) : undefined)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legal information */}
      <Card>
        <CardHeader>
          <CardTitle>{t('legalInfo')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company-legalName">{t('legalName')}</Label>
                <Input
                  id="company-legalName"
                  value={form.legalName}
                  onChange={(e) => setField('legalName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-tax">{t('taxRegistrationNumber')}</Label>
                <Input
                  id="company-tax"
                  value={form.taxRegistrationNumber}
                  onChange={(e) => setField('taxRegistrationNumber', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-regId">{t('registrationId')}</Label>
                <Input
                  id="company-regId"
                  value={form.registrationId}
                  onChange={(e) => setField('registrationId', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-regAgency">{t('registrationAgency')}</Label>
                <Input
                  id="company-regAgency"
                  value={form.registrationAgency}
                  onChange={(e) => setField('registrationAgency', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-country">{t('countryOfRegistration')}</Label>
                <Input
                  id="company-country"
                  value={form.countryOfRegistration}
                  onChange={(e) => setField('countryOfRegistration', e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {readField(t('legalName'), company.legalInfo?.legalName)}
              {readField(t('taxRegistrationNumber'), company.legalInfo?.taxRegistrationNumber)}
              {readField(t('registrationId'), company.legalInfo?.registrationId)}
              {readField(t('registrationAgency'), company.legalInfo?.registrationAgency)}
              {readField(t('countryOfRegistration'), company.legalInfo?.countryOfRegistration)}
              {readField(t('registrationDate'), company.legalInfo?.registrationDate)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Purchasing limit */}
      <Card>
        <CardHeader>
          <CardTitle>{t('accountLimit')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {readField(
              t('limitValue'),
              company.accountLimit?.value != null
                ? `${company.accountLimit.value} ${company.accountLimit.currency ?? ''}`.trim()
                : undefined,
            )}
          </div>
        </CardContent>
      </Card>

      {/* Locations */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>{t('addresses')}</CardTitle>
            <Button variant="secondary" size="small" asChild>
              <Link href="/account/addresses" data-testid="company-manageAddresses">
                <MapPin className="mr-2 h-4 w-4" />
                {t('manageAddresses')}
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {company.addresses && company.addresses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {company.addresses.map((address, index) => (
                <Card key={address.id ?? index} className="h-full">
                  <CardContent className="pt-6">
                    <AddressDisplay address={address} />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-start gap-4">
              <p className="text-text-placeholders">{t('noAddresses')}</p>
              <Button variant="secondary" size="small" asChild>
                <Link href="/account/addresses" data-testid="company-addAddress">
                  <MapPin className="mr-2 h-4 w-4" />
                  {t('addAddress')}
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {isEditing && (
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              setForm(toFormState(company));
              setIsEditing(false);
            }}
            disabled={isSaving}
          >
            {t('cancel')}
          </Button>
          <Button onClick={handleSave} disabled={isSaving} data-testid="company-save">
            {isSaving ? t('saving') : t('save')}
          </Button>
        </div>
      )}
    </div>
  );
}

export default CompanyDetails;
