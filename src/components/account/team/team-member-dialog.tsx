'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/ui/useToast';
import { getLogger } from '@/lib/logger/use-logger-client';
import type { CompanyGroup, CreateTeamMemberInput } from '@/platform/services/model/team/team';
import { MemberGroupFields } from './member-group-fields';

interface TeamMemberDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  groups: CompanyGroup[];
  onCreate: (input: CreateTeamMemberInput) => Promise<unknown>;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Dialog for creating (inviting) a new team member and assigning their groups.
 */
export function TeamMemberDialog({ isOpen, onOpenChange, groups, onCreate }: TeamMemberDialogProps) {
  const t = useTranslations('account.Team');
  const { toast } = useToast();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [managedRoleGroupId, setManagedRoleGroupId] = useState('');
  const [customGroupIds, setCustomGroupIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFirstName('');
      setLastName('');
      setEmail('');
      setManagedRoleGroupId('');
      setCustomGroupIds([]);
      setValidationError(null);
    }
  }, [isOpen]);

  const toggleCustomGroup = (groupId: string, checked: boolean) =>
    setCustomGroupIds((prev) => (checked ? [...prev, groupId] : prev.filter((id) => id !== groupId)));

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setValidationError(t('dialog.validationRequired'));
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setValidationError(t('dialog.invalidEmail'));
      return;
    }

    setValidationError(null);
    setIsSaving(true);
    try {
      const groupIds = [...(managedRoleGroupId ? [managedRoleGroupId] : []), ...customGroupIds];
      await onCreate({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), groupIds });
      toast({ title: t('dialog.createSuccessTitle'), description: t('dialog.createSuccess'), variant: 'success' });
      onOpenChange(false);
    } catch (error) {
      getLogger().error({ err: error }, 'Failed to create team member');
      toast({ title: t('dialog.error'), description: t('dialog.createError'), variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" showCloseButton>
        <DialogHeader>
          <DialogTitle>{t('dialog.title')}</DialogTitle>
          <DialogDescription>{t('dialog.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="team-firstName">{t('firstName')}</Label>
              <Input
                id="team-firstName"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                data-testid="teamMember-firstName"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-lastName">{t('lastName')}</Label>
              <Input
                id="team-lastName"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                data-testid="teamMember-lastName"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="team-email">{t('email')}</Label>
              <Input
                id="team-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                data-testid="teamMember-email"
              />
            </div>
          </div>

          <MemberGroupFields
            groups={groups}
            managedRoleGroupId={managedRoleGroupId}
            onManagedRoleChange={setManagedRoleGroupId}
            customGroupIds={customGroupIds}
            onToggleCustomGroup={toggleCustomGroup}
          />
        </div>

        {validationError && <p className="text-sm text-text-error">{validationError}</p>}

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isSaving}>
            {t('dialog.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={isSaving} data-testid="teamMember-saveButton">
            {isSaving ? t('dialog.creating') : t('dialog.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TeamMemberDialog;
