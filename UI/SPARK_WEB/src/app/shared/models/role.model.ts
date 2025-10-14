import { Permission, PermissionSummary } from './permission.model';
import { DefaultRoleName } from './permission.constants';

/**
 * Base role interface for API responses
 */
export interface Role {
  /** Unique identifier for the role */
  id: number;
  
  /** Role name (machine-readable) */
  name: string;
  
  /** Role description */
  description: string;
  
  /** Display name for UI */
  displayName?: string;
  
  /** Color code for UI (hex format) */
  color?: string;
  
  /** Role priority/hierarchy level */
  priority?: number;
  
  /** Whether role is active */
  active: boolean;
  
  /** System role (cannot be deleted) */
  systemRole: boolean;
  
  /** Timestamp when role was created */
  createdAt?: Date | string;
  
  /** Timestamp when role was last updated */
  updatedAt?: Date | string;
  
  /** User who created this role */
  createdBy?: string;
  
  /** User who last updated this role */
  updatedBy?: string;
}

/**
 * Role with full permission details
 */
export interface RoleWithPermissions extends Role {
  /** All permissions assigned to this role */
  permissions: Permission[];
  
  /** Count of permissions */
  permissionCount?: number;
  
  /** Count of users with this role */
  userCount?: number;
}

/**
 * Role with permission summaries (for performance)
 */
export interface RoleWithPermissionSummaries extends Role {
  /** Permission summaries assigned to this role */
  permissions: PermissionSummary[];
  
  /** Count of permissions */
  permissionCount?: number;
  
  /** Count of users with this role */
  userCount?: number;
}

/**
 * Role creation/update request interface
 */
export interface RoleRequest {
  /** Role name */
  name: string;
  
  /** Role description */
  description: string;
  
  /** Display name for UI */
  displayName?: string;
  
  /** Color code for UI */
  color?: string;
  
  /** Role priority */
  priority?: number;
  
  /** Whether role is active */
  active?: boolean;
  
  /** Permission IDs to assign to this role */
  permissionIds?: number[];
}

/**
 * Role with additional UI state
 */
export interface RoleWithState extends Role {
  /** Whether role is selected in UI */
  selected?: boolean;
  
  /** Whether role is loading in UI */
  loading?: boolean;
  
  /** Whether role is expanded in tree view */
  expanded?: boolean;
  
  /** Permissions assigned to this role */
  permissions?: PermissionSummary[];
  
  /** Whether permissions are loaded */
  permissionsLoaded?: boolean;
}

/**
 * Role summary for dropdown/selection components
 */
export interface RoleSummary {
  /** Role ID */
  id: number;
  
  /** Role name */
  name: string;
  
  /** Display name */
  displayName?: string;
  
  /** Description */
  description: string;
  
  /** Color for UI */
  color?: string;
  
  /** Priority level */
  priority?: number;
  
  /** Whether role is active */
  active: boolean;
  
  /** Whether it's a system role */
  systemRole: boolean;
  
  /** Count of permissions */
  permissionCount?: number;
}

/**
 * Role assignment interface
 */
export interface RoleAssignment {
  /** Assignment ID */
  id: number;
  
  /** User ID */
  userId: number;
  
  /** Role ID */
  roleId: number;
  
  /** Role details */
  role: RoleSummary;
  
  /** When assignment was made */
  assignedAt: Date | string;
  
  /** User who made the assignment */
  assignedBy?: string;
  
  /** Optional expiry date */
  expiresAt?: Date | string;
  
  /** Whether assignment is active */
  active: boolean;
  
  /** Whether this is the primary role */
  isPrimary: boolean;
  
  /** Optional notes */
  notes?: string;
}

/**
 * Role assignment request
 */
export interface RoleAssignmentRequest {
  /** User ID to assign role to */
  userId: number;
  
  /** Role ID to assign */
  roleId: number;
  
  /** Optional expiry date */
  expiresAt?: Date | string;
  
  /** Whether this should be the primary role */
  isPrimary?: boolean;
  
  /** Optional notes */
  notes?: string;
}

/**
 * Bulk role operations
 */
export interface BulkRoleRequest {
  /** Role IDs to operate on */
  roleIds: number[];
  
  /** Operation type */
  operation: 'activate' | 'deactivate' | 'delete';
  
  /** Optional reason for bulk operation */
  reason?: string;
}

export interface BulkRoleResponse {
  /** Number of roles successfully processed */
  processed: number;
  
  /** Number of roles that failed */
  failed: number;
  
  /** IDs of roles that failed */
  failedIds: number[];
  
  /** Error messages for failed operations */
  errors: string[];
}

/**
 * Role hierarchy interface
 */
export interface RoleHierarchy {
  /** Role information */
  role: RoleSummary;
  
  /** Parent role (if applicable) */
  parent?: RoleSummary;
  
  /** Child roles */
  children: RoleSummary[];
  
  /** Level in hierarchy */
  level: number;
}

/**
 * Role statistics
 */
export interface RoleStatistics {
  /** Total number of roles */
  totalRoles: number;
  
  /** Number of active roles */
  activeRoles: number;
  
  /** Number of system roles */
  systemRoles: number;
  
  /** Number of custom roles */
  customRoles: number;
  
  /** Most assigned role */
  mostAssignedRole?: RoleSummary;
  
  /** Least assigned role */
  leastAssignedRole?: RoleSummary;
  
  /** Average permissions per role */
  avgPermissionsPerRole: number;
}