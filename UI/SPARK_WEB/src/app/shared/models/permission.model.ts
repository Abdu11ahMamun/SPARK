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
 * Permission creation/update request interface
 */
export interface PermissionRequest {
  /** Machine-readable permission code */
  code: string;
  
  /** Human-readable permission name */
  name: string;
  
  /** Detailed description */
  description: string;
  
  /** Resource/module name */
  resource: string;
  
  /** Action type */
  action: PermissionAction;
  
  /** Optional category */
  category?: PermissionCategory;
  
  /** Optional display order */
  displayOrder?: number;
  
  /** Whether permission is active */
  active?: boolean;
}

/**
 * Permission with additional UI state
 */
export interface PermissionWithState extends Permission {
  /** Whether permission is selected in UI */
  selected?: boolean;
  
  /** Whether permission is loading in UI */
  loading?: boolean;
  
  /** Whether permission is expanded in tree view */
  expanded?: boolean;
  
  /** Child permissions (for hierarchical display) */
  children?: PermissionWithState[];
}

/**
 * Permission summary for dropdown/selection components
 */
export interface PermissionSummary {
  /** Permission ID */
  id: number;
  
  /** Permission code */
  code: PermissionCode;
  
  /** Display name */
  name: string;
  
  /** Brief description */
  description: string;
  
  /** Category for grouping */
  category?: PermissionCategory;
  
  /** Whether permission is active */
  active: boolean;
}

/**
 * Grouped permissions by category
 */
export interface GroupedPermissions {
  /** Category name */
  category: PermissionCategory;
  
  /** Display name for category */
  displayName: string;
  
  /** Permissions in this category */
  permissions: Permission[];
  
  /** Total count of permissions */
  count: number;
  
  /** Count of active permissions */
  activeCount: number;
}

/**
 * Permission check request
 */
export interface PermissionCheckRequest {
  /** User ID to check permissions for */
  userId: number;
  
  /** Permission code to check */
  permissionCode: PermissionCode;
  
  /** Optional resource context */
  resourceId?: number;
}

/**
 * Permission check response
 */
export interface PermissionCheckResponse {
  /** Whether user has the permission */
  hasPermission: boolean;
  
  /** Permission code that was checked */
  permissionCode: PermissionCode;
  
  /** User ID */
  userId: number;
  
  /** Optional reason if permission denied */
  reason?: string;
  
  /** Timestamp of check */
  checkedAt: Date | string;
}

/**
 * Bulk permission operations
 */
export interface BulkPermissionRequest {
  /** Permission IDs to operate on */
  permissionIds: number[];
  
  /** Operation type */
  operation: 'activate' | 'deactivate' | 'delete';
  
  /** Optional reason for bulk operation */
  reason?: string;
}

export interface BulkPermissionResponse {
  /** Number of permissions successfully processed */
  processed: number;
  
  /** Number of permissions that failed */
  failed: number;
  
  /** IDs of permissions that failed */
  failedIds: number[];
  
  /** Error messages for failed operations */
  errors: string[];
}