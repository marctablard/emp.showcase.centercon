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
import { useToast } from '@/hooks/ui/useToast';
import { getLogger } from '@/lib/logger/use-logger-client';
import type { CompanyGroup, CompanyRole, TeamMember } from '@/platform/services/model/team/team';
import { MemberGroupFields } from './member-group-fields';

const MANAGED_ROLES: CompanyRole[] = ['ADMIN', 'BUYER', 'REQUESTER'];

interface MemberRoleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember | null;
  groups: CompanyGroup[];
  onChangeGroups: (customerId: string, groupIds: string[]) => Promise<unknown>;
}

/**
 * Dialog for managing a team member's company group memberships.
 */
export function MemberRoleDialog({ isOpen, onOpenChange, member, groups, onChangeGroups }: MemberRoleDialogProps) {
  const t = useTranslations('account.Team');
  const { toast } = useToast();
  const [managedRoleGroupId, setManagedRoleGroupId] = useState('');
  const [customGroupIds, setCustomGroupIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && member) {
      const managedGroup = groups.find(
        (group) => MANAGED_ROLES.includes(group.role) && member.groupIds.includes(group.id),
      );
      setManagedRoleGroupId(managedGroup?.id ?? '');
      setCustomGroupIds(
        groups.filter((group) => group.role === 'OTHER' && member.groupIds.includes(group.id)).map((group) => group.id),
      );
    }
  }, [isOpen, member, groups]);

  const toggleCustomGroup = (groupId: string, checked: boolean) =>
    setCustomGroupIds((prev) => (checked ? [...prev, groupId] : prev.filter((id) => id !== groupId)));

  const memberName = member
    ? `${member.firstName ?? ''} ${member.lastName ?? ''}`.trim() || member.email || member.customerId
    : '';

  const handleSave = async () => {
    if (!member) {
      return;
    }
    setIsSaving(true);
    try {
      const groupIds = [...(managedRoleGroupId ? [managedRoleGroupId] : []), ...customGroupIds];
      await onChangeGroups(member.customerId, groupIds);
      toast({ title: t('roleDialog.successTitle'), description: t('roleDialog.success'), variant: 'success' });
      onOpenChange(false);
    } catch (error) {
      getLogger().error({ err: error }, 'Failed to update member groups');
      toast({ title: t('roleDialog.error'), description: t('roleDialog.errorDescription'), variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]" showCloseButton>
        <DialogHeader>
          <DialogTitle>{t('roleDialog.title')}</DialogTitle>
          <DialogDescription>{t('roleDialog.description', { name: memberName })}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <MemberGroupFields
            groups={groups}
            managedRoleGroupId={managedRoleGroupId}
            onManagedRoleChange={setManagedRoleGroupId}
            customGroupIds={customGroupIds}
            onToggleCustomGroup={toggleCustomGroup}
          />
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isSaving}>
            {t('dialog.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={isSaving} data-testid="memberRole-saveButton">
            {isSaving ? t('roleDialog.saving') : t('roleDialog.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default MemberRoleDialog;
