import { PermissionAction, PermissionCategory, ResourceType, PermissionCode } from './permission.constants';

/**
 * Base permission interface for API responses
 */
export interface Permission {
  /** Unique identifier for the permission */
  id: number;
  
  /** Machine-readable permission code */
  code: PermissionCode;
  
  /** Human-readable permission name */
  name: string;
  
  /** Detailed description of what this permission allows */
  description: string;
  
  /** Resource/module this permission applies to */
  resource: ResourceType;
  
  /** Type of action allowed (read, write, delete, admin, execute) */
  action: PermissionAction;
  
  /** Category for UI grouping */
  category?: PermissionCategory;
  
  /** Display order for UI sorting */
  displayOrder?: number;
  
  /** Whether permission is active */
  active: boolean;
  
  /** System permission (cannot be deleted) */
  systemPermission: boolean;
  
  /** Timestamp when permission was created */
  createdAt?: Date | string;
  
  /** Timestamp when permission was last updated */
  updatedAt?: Date | string;
  
  /** User who created this permission */
  createdBy?: string;
  
  /** User who last updated this permission */
  updatedBy?: string;
}

/**
 * Role interface for API responses
 */
export interface Role {
  /** Unique identifier for the role */
  id: number;
  
  /** Machine-readable role code */
  code: string;
  
  /** Human-readable role name */
  name: string;
  
  /** Role description */
  description?: string;
  
  /** Whether role is active */
  active: boolean;
  
  /** System role (cannot be deleted) */
  systemRole: boolean;
  
  /** Permissions assigned to this role */
  permissions?: Permission[];
  
  /** Number of users with this role */
  userCount?: number;
  
  /** Timestamp when role was created */
  createdAt?: Date | string;
  
  /** Timestamp when role was last updated */
  updatedAt?: Date | string;
}

/**
 * User role assignment interface
 */
export interface UserRole {
  /** Unique identifier */
  id: number;
  
  /** User ID */
  userId: number;
  
  /** Role ID */
  roleId: number;
  
  /** Role information */
  role?: Role;
  
  /** Assignment date */
  assignedAt?: Date | string;
  
  /** Expiry date (optional) */
  expiresAt?: Date | string;
  
  /** Who assigned this role */
  assignedBy?: number;
  
  /** Whether assignment is active */
  active: boolean;
}

/**
 * Permission request for creating/updating permissions
 */
export interface PermissionRequest {
  code: PermissionCode;
  name: string;
  description: string;
  resource: ResourceType;
  action: PermissionAction;
  category?: PermissionCategory;
  displayOrder?: number;
  active?: boolean;
}

/**
 * Role request for creating/updating roles
 */
export interface RoleRequest {
  code: string;
  name: string;
  description?: string;
  active?: boolean;
}

/**
 * Role permission assignment request
 */
export interface RolePermissionRequest {
  roleId: number;
  permissionId: number;
}

/**
 * Bulk role permission assignment request
 */
export interface BulkRolePermissionRequest {
  roleId: number;
  permissionIds: number[];
  /** Whether to remove existing permissions not in the list */
  replaceExisting?: boolean;
}

/**
 * User role assignment request
 */
export interface UserRoleRequest {
  userId: number;
  roleId: number;
  expiresAt?: Date | string;
}

/**
 * Permission check request
 */
export interface PermissionCheck {
  userId: number;
  permission: PermissionCode;
  resource?: string;
}

/**
 * Permission check response
 */
export interface PermissionCheckResponse {
  hasPermission: boolean;
  reason?: string;
}

/**
 * Grouped permissions DTO for UI display
 */
export interface GroupedPermissionsDto {
  [category: string]: Permission[];
}

/**
 * Permission matrix cell for role-permission management
 */
export interface PermissionMatrixCell {
  roleId: number;
  permissionId: number;
  assigned: boolean;
  role: Role;
  permission: Permission;
  changed?: boolean;
}

/**
 * Permission matrix for role-permission management
 */
export interface PermissionMatrix {
  roles: Role[];
  permissions: Permission[];
  assignments: { [roleId: number]: { [permissionId: number]: boolean } };
}

/**
 * Permission statistics for admin dashboard
 */
export interface PermissionStatistics {
  totalPermissions: number;
  activePermissions: number;
  systemPermissions: number;
  customPermissions: number;
  totalRoles: number;
  activeRoles: number;
  systemRoles: number;
  customRoles: number;
  totalUserRoles: number;
  activeUserRoles: number;
  expiredUserRoles: number;
}

/**
 * Permission audit log entry
 */
export interface PermissionAuditLog {
  id: number;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ASSIGN' | 'REVOKE';
  entityType: 'PERMISSION' | 'ROLE' | 'USER_ROLE';
  entityId: number;
  userId: number;
  userName?: string;
  details?: string;
  timestamp: Date | string;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: { [key: string]: string[] };
}

/**
 * Paginated response
 */
export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}