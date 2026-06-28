/**
 * B2B company team management domain model.
 *
 * A "team member" is an Emporix customer assigned to the currently selected
 * legal entity (company). Their role inside the company is derived from the
 * predefined, legal-entity-aware customer groups (Admin / Buyer / Requester /
 * Contact).
 */

/**
 * Normalized company group role. Mirrors the Emporix predefined customer
 * groups created for every legal entity. `OTHER` covers any custom group.
 */
export type CompanyRole = 'ADMIN' | 'BUYER' | 'REQUESTER' | 'CONTACT' | 'OTHER';

/**
 * A customer group attached to a legal entity (company).
 */
export interface CompanyGroup {
  /** Emporix IAM customer group id. */
  id: string;
  /** Normalized role for display / logic. */
  role: CompanyRole;
  /** Raw role string as returned by Emporix (e.g. "Admin"). */
  rawRole?: string;
  /** Best-effort display name for the group. */
  name?: string;
}

/**
 * A member of the currently selected company.
 */
export interface TeamMember {
  /** Emporix customer id. */
  customerId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  /** Ids of the company groups the member currently belongs to. */
  groupIds: string[];
  /** Normalized roles derived from the member's group memberships. */
  roles: CompanyRole[];
  /** Id of the contact assignment linking the member to the company. */
  contactAssignmentId?: string;
  /** Contact assignment type. */
  contactType?: 'PRIMARY' | 'BILLING' | 'LOGISTICS' | 'CONTACT';
  /** Whether the member is the primary contact of the company. */
  primary?: boolean;
}

/**
 * Payload for creating (inviting) a new team member.
 *
 * A member is always added to the company's Contact group automatically, may
 * hold at most one managed role group (Admin / Buyer / Requester) and any
 * number of custom groups. `groupIds` carries the explicitly selected groups
 * (managed role + custom); the Contact group is enforced server-side.
 */
export interface CreateTeamMemberInput {
  firstName: string;
  lastName: string;
  email: string;
  /** Company group ids to assign (managed role + custom groups). */
  groupIds: string[];
}
