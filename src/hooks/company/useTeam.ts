'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession as useAuthSession } from 'next-auth/react';
import { useSession } from '@/hooks/session/useSession';
import {
  createTeamMember,
  fetchCompanyGroups,
  fetchTeamMembers,
  removeTeamMember,
  updateTeamMemberGroups,
} from '@/lib/client/company';
import { getLogger } from '@/lib/logger/use-logger-client';
import type { CompanyGroup, CreateTeamMemberInput, TeamMember } from '@/platform/services/model/team/team';

interface TeamHook {
  members: TeamMember[];
  groups: CompanyGroup[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  createMember: (input: CreateTeamMemberInput) => Promise<TeamMember>;
  changeGroups: (customerId: string, groupIds: string[]) => Promise<void>;
  removeMember: (customerId: string) => Promise<void>;
}

/**
 * Hook for managing the team (members + roles) of the currently selected
 * company. Re-fetches whenever the selected legal entity changes.
 */
export function useTeam(): TeamHook {
  const { status } = useAuthSession();
  const { session } = useSession();
  const legalEntityId = session?.legalEntityId;

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [groups, setGroups] = useState<CompanyGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [memberList, groupList] = await Promise.all([fetchTeamMembers(), fetchCompanyGroups()]);
      setMembers(memberList);
      setGroups(groupList);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch team'));
      getLogger().error({ err }, 'Error fetching team');
    } finally {
      setLoading(false);
    }
  }, []);

  const createMember = useCallback(
    async (input: CreateTeamMemberInput): Promise<TeamMember> => {
      const member = await createTeamMember(input);
      await refresh();
      return member;
    },
    [refresh],
  );

  const changeGroups = useCallback(
    async (customerId: string, groupIds: string[]): Promise<void> => {
      await updateTeamMemberGroups(customerId, groupIds);
      await refresh();
    },
    [refresh],
  );

  const removeMember = useCallback(
    async (customerId: string): Promise<void> => {
      await removeTeamMember(customerId);
      await refresh();
    },
    [refresh],
  );

  useEffect(() => {
    if (status !== 'authenticated') {
      return;
    }
    refresh();
  }, [status, legalEntityId, refresh]);

  return { members, groups, loading, error, refresh, createMember, changeGroups, removeMember };
}

export default useTeam;
