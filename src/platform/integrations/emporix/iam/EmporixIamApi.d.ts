import { EmporixSearchParams } from '../model';
import {
  AccessControlQueryParams,
  EmporixAccessControl,
  EmporixGroup,
  EmporixGroupAssignment,
  EmporixGroupAssignmentRequest,
  EmporixIamUser,
  EmporixPermission,
  EmporixResource,
  EmporixRole,
  GroupAssignmentQueryParams,
  IamQueryParams,
} from '../model/iam';

/**
 * Interface for the Emporix IAM API
 * Provides access to Identity and Access Management functionality
 */
export interface EmporixIamApi {
  /**
   * Get all access controls for the tenant
   * @param params Query parameters for filtering
   * @returns List of access controls
   */
  getAccessControls(
    params: EmporixSearchParams<{ roleId: string; resourceId: string }>,
  ): Promise<EmporixPaginatedResponse<EmporixAccessControl>>;

  /**
   * Get an access control by ID
   * @param id Access control ID
   * @param expand Optional fields to expand
   * @returns Access control
   */
  getAccessControlById(id: string, expand?: string[]): Promise<EmporixAccessControl>;

  /**
   * Get all roles for the tenant
   * @param params Query parameters for filtering
   * @returns List of roles
   */
  getRoles(params?: EmporixSearchParams<EmporixRole>): Promise<EmporixPaginatedResponse<EmporixRole>>;

  /**
   * Get a role by ID
   * @param id Role ID
   * @param expand Optional fields to expand
   * @returns Role
   */
  getRoleById(id: string, expand?: string[]): Promise<EmporixRole>;

  /**
   * Get all groups for the tenant
   * @param params Query parameters for filtering
   * @returns List of groups
   */
  getGroups(params?: EmporixSearchParams<EmporixGroup>): Promise<EmporixGroup[]>;

  /**
   * Get a group by ID
   * @param id Group ID
   * @returns Group
   */
  getGroupById(id: string): Promise<EmporixGroup>;

  /**
   * Create a new group
   * @param group Group to create
   * @returns Created group
   */
  createGroup(group: EmporixGroup): Promise<EmporixGroup>;

  /**
   * Update a group
   * @param id Group ID
   * @param group Updated group data
   */
  updateGroup(id: string, group: EmporixGroup): Promise<void>;

  /**
   * Delete a group
   * @param id Group ID
   */
  deleteGroup(id: string): Promise<void>;

  /**
   * Retrieves the users assigned to a specific group.
   * @param groupId Group ID
   * @returns List of group user assignments
   */
  getGroupUsers(groupId: string): Promise<EmporixGroupAssignment[]>;

  /**
   * Adds a User to a group
   * @param groupId
   * @param groupAssignment
   */
  addUserToGroup(groupId: string, groupAssignment: EmporixGroupAssignmentRequest): Promise<{ id: string }>;

  /**
   * Removes a user from a group.
   * @param groupId Group ID
   * @param userId User ID
   */
  removeUserFromGroup(groupId: string, userId: string): Promise<void>;

  /**
   * Adds a User to a group
   * @param groupId
   * @param groupAssignment
   */
  updateUserInGroup(
    groupId: string,
    groupAssignment: EmporixGroupAssignmentRequest,
  ): Promise<EmporixGroupAssignmentRequest>;

  /**
   * Get the current user's scopes
   * @param userId Optional user ID to get scopes for
   * @returns List of scope strings for the current user
   */
  getUserScopes(userId?: string): Promise<{ userId: string; scopes: string }>;

  /**
   * Get the current user's access controls
   * @param userId Optional user ID to get access controls for
   * @returns List of access controls for the current user
   */
  getUserAccessControls(userId?: string): Promise<EmporixAccessControl[]>;

  /**
   * Get the user's groups
   * @param userId User ID to get groups for
   * @param searchParams Optional search parameters for filtering
   * @returns List of groups for the user
   */
  getUserGroups(
    userId: string,
    searchParams?: EmporixSearchParams<EmporixGroup>,
  ): Promise<EmporixPaginatedResponse<EmporixGroup>>;
}
