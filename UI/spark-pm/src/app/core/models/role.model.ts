/**
 * Basic role model (legacy compatibility)
 */
export interface RoleModel {
  id?: number;
  name: string;
  description?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Enhanced role model with RBAC features
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
