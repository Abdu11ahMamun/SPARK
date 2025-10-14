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