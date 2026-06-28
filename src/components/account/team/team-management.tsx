'use client';

import React, { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Pencil, Trash, UserPlus } from 'lucide-react';
import { Badge, type BadgeVariant } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTeam } from '@/hooks/company/useTeam';
import useCustomer from '@/hooks/customer/useCustomer';
import { useToast } from '@/hooks/ui/useToast';
import { getLogger } from '@/lib/logger/use-logger-client';
import { CustomerRole } from '@/platform/services/model/customer/roles';
import type { CompanyGroup, CompanyRole, TeamMember } from '@/platform/services/model/team/team';
import { MemberRoleDialog } from './member-role-dialog';
import { TeamMemberDialog } from './team-member-dialog';

const ROLE_BADGE_VARIANT: Record<CompanyRole, BadgeVariant> = {
  ADMIN: 'information',
  BUYER: 'success',
  REQUESTER: 'warning',
  CONTACT: 'secondary',
  OTHER: 'muted',
};

/** Order groups so the most significant role is shown first, custom groups last. */
const ROLE_PRIORITY: CompanyRole[] = ['ADMIN', 'BUYER', 'REQUESTER', 'CONTACT', 'OTHER'];

export function TeamManagement() {
  const t = useTranslations('account.Team');
  const { toast } = useToast();
  const { members, groups, loading, error, refresh, createMember, changeGroups, removeMember } = useTeam();
  const { customer } = useCustomer();

  const groupById = useMemo(() => new Map(groups.map((group) => [group.id, group])), [groups]);

  const memberGroups = (member: TeamMember): CompanyGroup[] =>
    member.groupIds
      .map((id) => groupById.get(id))
      .filter((group): group is CompanyGroup => Boolean(group))
      .sort((a, b) => ROLE_PRIORITY.indexOf(a.role) - ROLE_PRIORITY.indexOf(b.role));

  const isAdmin = !!customer?.roles?.includes(CustomerRole.B2B_ADMIN);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [roleDialogMember, setRoleDialogMember] = useState<TeamMember | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const memberName = (member: TeamMember) =>
    `${member.firstName ?? ''} ${member.lastName ?? ''}`.trim() || member.email || member.customerId;

  const handleRemove = async (member: TeamMember) => {
    if (!window.confirm(t('confirmRemove', { name: memberName(member) }))) {
      return;
    }
    setRemovingId(member.customerId);
    try {
      await removeMember(member.customerId);
      toast({ title: t('removeSuccessTitle'), description: t('removeSuccess'), variant: 'success' });
    } catch (err) {
      getLogger().error({ err }, 'Failed to remove team member');
      toast({ title: t('error'), description: t('removeError'), variant: 'destructive' });
    } finally {
      setRemovingId(null);
    }
  };

  if (loading && members.length === 0) {
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
        <Button variant="secondary" onClick={() => refresh()} className="mt-4">
          {t('tryAgain')}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <p className="text-text-placeholders max-w-2xl">{t('description')}</p>
        {isAdmin && (
          <Button onClick={() => setIsCreateOpen(true)} data-testid="team-addMember">
            <UserPlus className="mr-2 h-4 w-4" />
            {t('addMember')}
          </Button>
        )}
      </div>

      {!isAdmin && <p className="text-sm text-text-placeholders mb-4">{t('adminOnlyNotice')}</p>}

      {members.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-placeholders">{t('noMembers')}</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('name')}</TableHead>
              <TableHead>{t('email')}</TableHead>
              <TableHead>{t('role')}</TableHead>
              {isAdmin && <TableHead className="text-right">{t('actions')}</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.customerId}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {memberName(member)}
                    {member.primary && (
                      <Badge variant="outline" rounded="default">
                        {t('primary')}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{member.email ?? '—'}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {memberGroups(member).length === 0 ? (
                      <span className="text-text-placeholders">—</span>
                    ) : (
                      memberGroups(member).map((group) => (
                        <Badge key={group.id} variant={ROLE_BADGE_VARIANT[group.role]} rounded="default">
                          {group.role === 'OTHER' ? (group.name ?? group.id) : t(`roleLabels.${group.role}`)}
                        </Badge>
                      ))
                    )}
                  </div>
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setRoleDialogMember(member)}
                        aria-label={t('manageGroups')}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleRemove(member)}
                        disabled={removingId === member.customerId}
                        aria-label={t('removeMember')}
                      >
                        {removingId === member.customerId ? <Spinner variant="sm" /> : <Trash className="h-4 w-4" />}
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <TeamMemberDialog isOpen={isCreateOpen} onOpenChange={setIsCreateOpen} groups={groups} onCreate={createMember} />
      <MemberRoleDialog
        isOpen={roleDialogMember !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRoleDialogMember(null);
          }
        }}
        member={roleDialogMember}
        groups={groups}
        onChangeGroups={changeGroups}
      />
    </div>
  );
}

export default TeamManagement;
