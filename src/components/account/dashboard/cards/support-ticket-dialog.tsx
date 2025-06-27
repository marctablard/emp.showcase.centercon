'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { HelpingHand } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export interface SupportTicketData {
  subject: string;
  message: string;
}

export interface SupportTicketDialogProps {
  onSubmit?: (data: SupportTicketData) => void;
}

export function SupportTicketDialog({ onSubmit }: SupportTicketDialogProps) {
  const t = useTranslations('Account');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    // Call the onSubmit callback if provided
    if (onSubmit) {
      onSubmit({ subject, message });
    } else {
      // Fallback behavior if no callback is provided
      console.log('Sending ticket:', { subject, message });
    }

    // Reset form fields
    setSubject('');
    setMessage('');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          {t('newServiceTicket')}
          <HelpingHand className="ml-2" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('serviceTicketDialog.title')}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="subject">{t('serviceTicketDialog.subject')}</label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t('serviceTicketDialog.subjectPlaceholder')}
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="message">{t('serviceTicketDialog.message')}</label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('serviceTicketDialog.messagePlaceholder')}
              maxLength={500}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit}>{t('serviceTicketDialog.send')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
