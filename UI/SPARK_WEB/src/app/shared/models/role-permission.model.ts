import { Permission, PermissionSummary } from './permission.model';
import { Role, RoleSummary } from './role.model';

/**
 * Role-Permission mapping interface
 */
export interface RolePermission {
  /** Mapping ID */
  id: number;
  
  /** Role ID */
  roleId: number;
  
  /** Permission ID */
  permissionId: number;
  
  /** When permission was granted */
  grantedAt: Date | string;
  
  /** User who granted the permission */
  grantedBy?: string;
  
  /** Optional notes about the grant */
  notes?: string;
  
  /** Whether this mapping is active */
  active: boolean;
}

/**
 * Role-Permission mapping with full details
 */
export interface RolePermissionWithDetails extends RolePermission {
  /** Role details */
  role: RoleSummary;
  
  /** Permission details */
  permission: PermissionSummary;
}

/**
 * Role-Permission assignment request
 */
export interface RolePermissionRequest {
  /** Role ID */
  roleId: number;
  
  /** Permission ID */
  permissionId: number;
  
  /** Optional notes */
  notes?: string;
}

/**
 * Bulk role-permission operations
 */
export interface BulkRolePermissionRequest {
  /** Role ID */
  roleId: number;
  
  /** Permission IDs to assign/remove */
  permissionIds: number[];
  
  /** Operation type */
  operation: 'assign' | 'remove' | 'toggle';
  
  /** Optional notes */
  notes?: string;
}

export interface BulkRolePermissionResponse {
  /** Role ID */
  roleId: number;
  
  /** Number of permissions successfully processed */
  processed: number;
  
  /** Number of permissions that failed */
  failed: number;
  
  /** IDs of permissions that failed */
  failedPermissionIds: number[];
  
  /** Error messages for failed operations */
  errors: string[];
  
  /** Updated permission count for the role */
  totalPermissions: number;
}

/**
 * User-Role mapping interface
 */
export interface UserRole {
  /** Mapping ID */
  id: number;
  
  /** User ID */
  userId: number;
  
  /** Role ID */
  roleId: number;
  
  /** When role was assigned */
  assignedAt: Date | string;
  
  /** User who assigned the role */
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
 * User-Role mapping with full details
 */
export interface UserRoleWithDetails extends UserRole {
  /** Role details */
  role: RoleSummary;
  
  /** User display name */
  userName?: string;
  
  /** User email */
  userEmail?: string;
}

/**
 * User-Role assignment request
 */
export interface UserRoleRequest {
  /** User ID */
  userId: number;
  
  /** Role ID */
  roleId: number;
  
  /** Optional expiry date */
  expiresAt?: Date | string;
  
  /** Whether this should be the primary role */
  isPrimary?: boolean;
  
  /** Optional notes */
  notes?: string;
}

/**
 * Bulk user-role operations
 */
export interface BulkUserRoleRequest {
  /** User ID */
  userId: number;
  
  /** Role IDs to assign/remove */
  roleIds: number[];
  
  /** Operation type */
  operation: 'assign' | 'remove' | 'replace';
  
  /** For replace operation, whether to keep primary role */
  keepPrimary?: boolean;
  
  /** Optional notes */
  notes?: string;
}

export interface BulkUserRoleResponse {
  /** User ID */
  userId: number;
  
  /** Number of roles successfully processed */
  processed: number;
  
  /** Number of roles that failed */
  failed: number;
  
  /** IDs of roles that failed */
  failedRoleIds: number[];
  
  /** Error messages for failed operations */
  errors: string[];
  
  /** Updated role assignments */
  currentRoles: UserRoleWithDetails[];
}

/**
 * Permission inheritance chain
 */
export interface PermissionInheritance {
  /** Permission details */
  permission: PermissionSummary;
  
  /** Source role that grants this permission */
  sourceRole: RoleSummary;
  
  /** Whether permission is directly assigned or inherited */
  isDirect: boolean;
  
  /** Inheritance path (for nested inheritance) */
  inheritancePath?: RoleSummary[];
}

/**
 * User effective permissions
 */
export interface UserEffectivePermissions {
  /** User ID */
  userId: number;
  
  /** All permissions user has through roles */
  permissions: PermissionInheritance[];
  
  /** User's active roles */
  roles: UserRoleWithDetails[];
  
  /** Timestamp when permissions were calculated */
  calculatedAt: Date | string;
  
  /** Whether user is admin (has all permissions) */
  isAdmin: boolean;
}

/**
 * Permission matrix for role comparison
 */
export interface PermissionMatrix {
  /** Roles being compared */
  roles: RoleSummary[];
  
  /** All permissions across roles */
  permissions: PermissionSummary[];
  
  /** Matrix of role-permission mappings */
  matrix: { [roleId: number]: { [permissionId: number]: boolean } };
  
  /** Summary statistics */
  statistics: {
    totalPermissions: number;
    sharedPermissions: number;
    uniquePermissions: { [roleId: number]: number };
  };
}