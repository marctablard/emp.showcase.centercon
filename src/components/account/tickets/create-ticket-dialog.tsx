'use client';

import React, { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { HelpingHand, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { ToastType, notify } from '@/components/ui/toast-notification';
import { createServiceTicket } from '@/lib/client/servicetickets';
import type { ServiceTicketType } from '@/platform/services/model/serviceticket';

interface CreateTicketDialogProps {
  types: ServiceTicketType[];
  onCreated?: (ticketId: string) => void;
  triggerVariant?: 'default' | 'compact';
}

export function CreateTicketDialog({ types, onCreated, triggerVariant = 'default' }: CreateTicketDialogProps) {
  const t = useTranslations('account.serviceTickets');
  const locale = useLocale();

  const [open, setOpen] = useState(false);
  const [typeId, setTypeId] = useState('');
  const [subject, setSubject] = useState('');
  const [summary, setSummary] = useState('');
  const [businessImpact, setBusinessImpact] = useState('');
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const selectedType = useMemo(() => types.find((type) => type.id === typeId), [types, typeId]);

  const resetForm = () => {
    setTypeId('');
    setSubject('');
    setSummary('');
    setBusinessImpact('');
    setFieldValues({});
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      resetForm();
    }
  };

  const isValid = () => {
    if (!typeId || subject.trim() === '' || summary.trim() === '') {
      return false;
    }
    if (selectedType) {
      for (const field of selectedType.fields) {
        if (field.required && (fieldValues[field.id] ?? '').trim() === '') {
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!isValid() || !selectedType) {
      return;
    }
    setSubmitting(true);
    try {
      const properties: Record<string, string | number> = {};
      for (const field of selectedType.fields) {
        const raw = (fieldValues[field.id] ?? '').trim();
        if (raw === '') {
          continue;
        }
        properties[field.id] = field.type === 'NUMBER' ? Number(raw) : raw;
      }

      const { id } = await createServiceTicket(
        {
          typeId,
          subject: subject.trim(),
          summary: summary.trim(),
          businessImpact: businessImpact.trim() || undefined,
          properties,
        },
        locale,
      );

      notify({ title: t('createDialog.success'), type: ToastType.Success });
      handleOpenChange(false);
      onCreated?.(id);
    } catch (error) {
      notify({
        title: t('createDialog.error'),
        description: error instanceof Error ? error.message : undefined,
        type: ToastType.Error,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {triggerVariant === 'compact' ? (
          <Button size="small">
            <Plus className="mr-1 h-4 w-4" />
            {t('newTicket')}
          </Button>
        ) : (
          <Button>
            {t('newTicket')}
            <HelpingHand className="ml-2 h-5 w-5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('createDialog.title')}</DialogTitle>
          <DialogDescription>{t('createDialog.description')}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <label htmlFor="ticket-type" className="text-sm font-medium">
              {t('createDialog.requestType')} <span className="text-text-error">*</span>
            </label>
            <Select value={typeId} onValueChange={setTypeId}>
              <SelectTrigger id="ticket-type" data-testid="serviceTicket-type">
                <SelectValue placeholder={t('createDialog.selectRequestType')} />
              </SelectTrigger>
              <SelectContent>
                {types.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label htmlFor="ticket-subject" className="text-sm font-medium">
              {t('createDialog.subject')} <span className="text-text-error">*</span>
            </label>
            <Input
              id="ticket-subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder={t('createDialog.subjectPlaceholder')}
              maxLength={150}
              data-testid="serviceTicket-subject"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="ticket-summary" className="text-sm font-medium">
              {t('createDialog.summary')} <span className="text-text-error">*</span>
            </label>
            <Textarea
              id="ticket-summary"
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              placeholder={t('createDialog.summaryPlaceholder')}
              maxLength={1000}
              data-testid="serviceTicket-summary"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="ticket-impact" className="text-sm font-medium">
              {t('createDialog.businessImpact')}
            </label>
            <Input
              id="ticket-impact"
              value={businessImpact}
              onChange={(event) => setBusinessImpact(event.target.value)}
              placeholder={t('createDialog.businessImpactPlaceholder')}
              maxLength={250}
            />
          </div>

          {selectedType && selectedType.fields.length > 0 && (
            <div className="grid gap-4 rounded-lg bg-surface-secondary/50 p-4">
              <p className="text-sm font-semibold text-text-headings">{t('createDialog.detailsSection')}</p>
              {selectedType.fields.map((field) => (
                <div key={field.id} className="grid gap-2">
                  <label htmlFor={`field-${field.id}`} className="text-sm font-medium">
                    {field.label}
                    {field.required && <span className="text-text-error"> *</span>}
                  </label>
                  <Input
                    id={`field-${field.id}`}
                    type={field.type === 'NUMBER' ? 'number' : 'text'}
                    value={fieldValues[field.id] ?? ''}
                    onChange={(event) => setFieldValues((prev) => ({ ...prev, [field.id]: event.target.value }))}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => handleOpenChange(false)} disabled={submitting}>
            {t('createDialog.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid() || submitting} data-testid="serviceTicket-submit">
            {submitting ? <Spinner variant="sm" color="white" /> : t('createDialog.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateTicketDialog;
