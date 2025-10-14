import { Role, RoleSummary, RoleAssignment } from './role.model';
import { PermissionSummary } from './permission.model';
import { UserEffectivePermissions } from './role-permission.model';

/**
 * Base user interface
 */
export interface User {
  /** Unique identifier */
  id: number;
  
  /** Username */
  username: string;
  
  /** Email address */
  email: string;
  
  /** First name */
  firstName: string;
  
  /** Last name */
  lastName: string;
  
  /** Full name (computed) */
  fullName?: string;
  
  /** Whether user is active */
  active: boolean;
  
  /** Whether user account is verified */
  verified: boolean;
  
  /** Last login timestamp */
  lastLoginAt?: Date | string;
  
  /** Account creation timestamp */
  createdAt: Date | string;
  
  /** Last update timestamp */
  updatedAt?: Date | string;
  
  /** User who created this account */
  createdBy?: string;
  
  /** User who last updated this account */
  updatedBy?: string;
}

/**
 * User with role information
 */
export interface UserWithRoles extends User {
  /** User's role assignments */
  roleAssignments: RoleAssignment[];
  
  /** Primary role */
  primaryRole?: RoleSummary;
  
  /** All roles (active only) */
  roles: RoleSummary[];
  
  /** Count of roles */
  roleCount?: number;
}

/**
 * User with full RBAC context
 */
export interface UserWithPermissions extends UserWithRoles {
  /** Effective permissions through all roles */
  effectivePermissions: UserEffectivePermissions;
  
  /** Whether user has admin privileges */
  isAdmin: boolean;
  
  /** Quick permission lookup map */
  permissionMap: { [permissionCode: string]: boolean };
  
  /** Permission calculation timestamp */
  permissionsCalculatedAt: Date | string;
}

/**
 * User summary for lists and selections
 */
export interface UserSummary {
  /** User ID */
  id: number;
  
  /** Username */
  username: string;
  
  /** Email */
  email: string;
  
  /** Full name */
  fullName: string;
  
  /** Whether user is active */
  active: boolean;
  
  /** Primary role name */
  primaryRoleName?: string;
  
  /** Role count */
  roleCount: number;
  
  /** Last login */
  lastLoginAt?: Date | string;
}

/**
 * User creation/update request
 */
export interface UserRequest {
  /** Username */
  username: string;
  
  /** Email address */
  email: string;
  
  /** First name */
  firstName: string;
  
  /** Last name */
  lastName: string;
  
  /** Password (for creation only) */
  password?: string;
  
  /** Whether user is active */
  active?: boolean;
  
  /** Role IDs to assign */
  roleIds?: number[];
  
  /** Primary role ID */
  primaryRoleId?: number;
}

/**
 * User profile for current user context
 */
export interface UserProfile extends UserWithPermissions {
  /** Avatar URL */
  avatarUrl?: string;
  
  /** User preferences */
  preferences?: UserPreferences;
  
  /** Recent activity */
  recentActivity?: UserActivity[];
  
  /** Account settings */
  settings?: UserSettings;
}

/**
 * User preferences
 */
export interface UserPreferences {
  /** UI theme */
  theme: 'light' | 'dark' | 'system';
  
  /** Language preference */
  language: string;
  
  /** Timezone */
  timezone: string;
  
  /** Date format preference */
  dateFormat: string;
  
  /** Notification preferences */
  notifications: NotificationPreferences;
  
  /** Dashboard layout preferences */
  dashboardLayout?: any;
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  /** Email notifications enabled */
  email: boolean;
  
  /** Browser notifications enabled */
  browser: boolean;
  
  /** Mobile push notifications enabled */
  mobile: boolean;
  
  /** Specific notification types */
  types: {
    taskAssigned: boolean;
    taskUpdated: boolean;
    teamInvitation: boolean;
    projectUpdates: boolean;
    systemAlerts: boolean;
  };
}

/**
 * User activity log
 */
export interface UserActivity {
  /** Activity ID */
  id: number;
  
  /** Activity type */
  type: 'login' | 'logout' | 'permission_granted' | 'role_assigned' | 'profile_updated' | 'password_changed';
  
  /** Activity description */
  description: string;
  
  /** Activity timestamp */
  timestamp: Date | string;
  
  /** IP address */
  ipAddress?: string;
  
  /** User agent */
  userAgent?: string;
  
  /** Additional metadata */
  metadata?: any;
}

/**
 * User settings
 */
export interface UserSettings {
  /** Two-factor authentication enabled */
  twoFactorEnabled: boolean;
  
  /** Session timeout (in minutes) */
  sessionTimeout: number;
  
  /** Account lockout threshold */
  lockoutThreshold: number;
  
  /** Password expiry (in days) */
  passwordExpiryDays: number;
  
  /** Force password change on next login */
  forcePasswordChange: boolean;
}

/**
 * User statistics
 */
export interface UserStatistics {
  /** Total users */
  totalUsers: number;
  
  /** Active users */
  activeUsers: number;
  
  /** Verified users */
  verifiedUsers: number;
  
  /** Users by role */
  usersByRole: { [roleName: string]: number };
  
  /** Recent registrations */
  recentRegistrations: number;
  
  /** Users logged in last 24h */
  activeLastDay: number;
  
  /** Users logged in last 7 days */
  activeLastWeek: number;
  
  /** Users logged in last 30 days */
  activeLastMonth: number;
}

/**
 * User search/filter criteria
 */
export interface UserSearchCriteria {
  /** Search query (name, email, username) */
  query?: string;
  
  /** Filter by role IDs */
  roleIds?: number[];
  
  /** Filter by active status */
  active?: boolean;
  
  /** Filter by verified status */
  verified?: boolean;
  
  /** Filter by creation date range */
  createdAfter?: Date | string;
  createdBefore?: Date | string;
  
  /** Filter by last login date range */
  lastLoginAfter?: Date | string;
  lastLoginBefore?: Date | string;
  
  /** Sort field */
  sortBy?: 'username' | 'email' | 'fullName' | 'createdAt' | 'lastLoginAt';
  
  /** Sort direction */
  sortDirection?: 'asc' | 'desc';
  
  /** Page number (0-based) */
  page?: number;
  
  /** Page size */
  size?: number;
}