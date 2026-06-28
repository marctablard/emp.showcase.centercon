import { getLogger } from '@/lib/logger/use-logger-client';
import type { Company, CompanyDetails, CompanyUpdateDto } from '@/platform/services/model/company/company';
import type { CompanyGroup, CreateTeamMemberInput, TeamMember } from '@/platform/services/model/team/team';

/**
 * Fetch the current Company information.
 * @returns {Promise<Company|null>} The company or null if not logged in.
 */
export async function fetchCurrentCompany(): Promise<Company | null> {
  try {
    const response = await fetch('/api/company/current');

    if (response.status === 204) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch company: ${response.statusText}`);
    }

    return (await response.json()) as Company;
  } catch (error) {
    getLogger().error({ err: error }, 'Error fetching company');
    return null;
  }
}

/**
 * Fetch full details of the currently selected company (legal entity).
 * @returns {Promise<CompanyDetails|null>} The company details or null if none.
 */
export async function fetchCompanyDetails(): Promise<CompanyDetails | null> {
  const response = await fetch('/api/company/current');
  if (response.status === 204) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch company details: ${response.statusText}`);
  }
  return (await response.json()) as CompanyDetails;
}

/**
 * Update the currently selected company (legal entity).
 */
export async function updateCompanyDetails(update: CompanyUpdateDto): Promise<CompanyDetails> {
  const response = await fetch('/api/company/current', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  });
  if (!response.ok) {
    throw new Error(`Failed to update company details: ${response.statusText}`);
  }
  return (await response.json()) as CompanyDetails;
}

/**
 * Fetch the members of the currently selected company.
 */
export async function fetchTeamMembers(): Promise<TeamMember[]> {
  const response = await fetch('/api/company/current/team');
  if (!response.ok) {
    throw new Error(`Failed to fetch team members: ${response.statusText}`);
  }
  return (await response.json()) as TeamMember[];
}

/**
 * Fetch the predefined company groups (roles) members can be assigned to.
 */
export async function fetchCompanyGroups(): Promise<CompanyGroup[]> {
  const response = await fetch('/api/company/current/team/groups');
  if (!response.ok) {
    throw new Error(`Failed to fetch company groups: ${response.statusText}`);
  }
  return (await response.json()) as CompanyGroup[];
}

/**
 * Create (invite) a new team member.
 */
export async function createTeamMember(input: CreateTeamMemberInput): Promise<TeamMember> {
  const response = await fetch('/api/company/current/team', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(`Failed to create team member: ${response.statusText}`);
  }
  return (await response.json()) as TeamMember;
}

/**
 * Set a member's company group memberships (managed role + custom groups).
 * The Contact group is always retained server-side.
 */
export async function updateTeamMemberGroups(customerId: string, groupIds: string[]): Promise<TeamMember> {
  const response = await fetch(`/api/company/current/team/${encodeURIComponent(customerId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ groupIds }),
  });
  if (!response.ok) {
    throw new Error(`Failed to update team member groups: ${response.statusText}`);
  }
  return (await response.json()) as TeamMember;
}

/**
 * Remove a member from the currently selected company.
 */
export async function removeTeamMember(customerId: string): Promise<void> {
  const response = await fetch(`/api/company/current/team/${encodeURIComponent(customerId)}`, {
    method: 'DELETE',
  });
  if (!response.ok && response.status !== 204) {
    throw new Error(`Failed to remove team member: ${response.statusText}`);
  }
}

// Re-export to keep a stable import surface for callers.
export type { CompanyDetails, CompanyUpdateDto, CompanyGroup, CreateTeamMemberInput, TeamMember };
