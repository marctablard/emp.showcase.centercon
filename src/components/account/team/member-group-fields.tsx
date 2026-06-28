'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { CompanyGroup, CompanyRole } from '@/platform/services/model/team/team';

const MANAGED_ROLES: CompanyRole[] = ['ADMIN', 'BUYER', 'REQUESTER'];

interface MemberGroupFieldsProps {
  groups: CompanyGroup[];
  /** Selected managed role group id, or '' when no managed role is assigned. */
  managedRoleGroupId: string;
  onManagedRoleChange: (groupId: string) => void;
  /** Selected custom (non-managed, non-contact) group ids. */
  customGroupIds: string[];
  onToggleCustomGroup: (groupId: string, checked: boolean) => void;
}

/**
 * Shared group-assignment fields used by the create and edit dialogs.
 *
 * Reflects the company group rules:
 * - Contact group membership is automatic (shown as a fixed badge).
 * - At most one managed role group (Admin / Buyer / Requester) via radios.
 * - Any number of custom groups via checkboxes.
 */
export function MemberGroupFields({
  groups,
  managedRoleGroupId,
  onManagedRoleChange,
  customGroupIds,
  onToggleCustomGroup,
}: MemberGroupFieldsProps) {
  const t = useTranslations('account.Team');

  const managedGroups = groups.filter((group) => MANAGED_ROLES.includes(group.role));
  const customGroups = groups.filter((group) => group.role === 'OTHER');
  const hasContactGroup = groups.some((group) => group.role === 'CONTACT');

  return (
    <div className="space-y-6">
      {hasContactGroup && (
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" rounded="default">
            {t('roleLabels.CONTACT')}
          </Badge>
          <span className="text-sm text-text-placeholders">{t('contactAlwaysHint')}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label>{t('primaryRole')}</Label>
        <p className="text-sm text-text-placeholders">{t('primaryRoleHint')}</p>
        <RadioGroup
          className="gap-3"
          value={managedRoleGroupId || 'none'}
          onValueChange={(value) => onManagedRoleChange(value === 'none' ? '' : value)}
        >
          <label htmlFor="role-none" className="flex items-center gap-3 cursor-pointer">
            <RadioGroupItem value="none" id="role-none" />
            <span>{t('noPrimaryRole')}</span>
          </label>
          {managedGroups.map((group) => (
            <label key={group.id} htmlFor={`role-${group.id}`} className="flex items-center gap-3 cursor-pointer">
              <RadioGroupItem value={group.id} id={`role-${group.id}`} />
              <span>{t(`roleLabels.${group.role}`)}</span>
            </label>
          ))}
        </RadioGroup>
      </div>

      {customGroups.length > 0 && (
        <div className="space-y-2">
          <Label>{t('additionalGroups')}</Label>
          <div className="space-y-2">
            {customGroups.map((group) => {
              const checkboxId = `group-${group.id}`;
              return (
                <label key={group.id} htmlFor={checkboxId} className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    id={checkboxId}
                    checked={customGroupIds.includes(group.id)}
                    onCheckedChange={(checked) => onToggleCustomGroup(group.id, checked === true)}
                  />
                  <span>{group.name ?? group.id}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default MemberGroupFields;
