/**
 * Permission constants and enums for RBAC system
 * These constants must match the backend Permission entity
 */

// Permission Actions
export enum PermissionAction {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  ADMIN = 'admin',
  EXECUTE = 'execute'
}

// Permission Categories for UI grouping
export enum PermissionCategory {
  DASHBOARD = 'DASHBOARD',
  USER_MANAGEMENT = 'USER_MANAGEMENT',
  ROLE_MANAGEMENT = 'ROLE_MANAGEMENT',
  TEAM_MANAGEMENT = 'TEAM_MANAGEMENT',
  TASK_MANAGEMENT = 'TASK_MANAGEMENT',
  PROJECT_MANAGEMENT = 'PROJECT_MANAGEMENT',
  SYSTEM_ADMIN = 'SYSTEM_ADMIN'
}

// Resource Types
export enum ResourceType {
  DASHBOARD = 'dashboard',
  USERS = 'users',
  ROLES = 'roles',
  TEAMS = 'teams',
  TASKS = 'tasks',
  TASK_TYPES = 'task-types',
  PROJECTS = 'projects',
  SPRINTS = 'sprints',
  SYSTEM = 'system'
}

// Predefined Permission Codes (must match backend)
export const PERMISSION_CODES = {
  // Dashboard
  DASHBOARD_VIEW: 'DASHBOARD_VIEW',
  DASHBOARD_ADMIN: 'DASHBOARD_ADMIN',
  
  // User Management
  USER_VIEW: 'USER_VIEW',
  USER_CREATE: 'USER_CREATE',
  USER_DELETE: 'USER_DELETE',
  USER_ADMIN: 'USER_ADMIN',
  
  // Role Management
  ROLE_VIEW: 'ROLE_VIEW',
  ROLE_CREATE: 'ROLE_CREATE',
  ROLE_DELETE: 'ROLE_DELETE',
  ROLE_ADMIN: 'ROLE_ADMIN',
  
  // Team Management
  TEAM_VIEW: 'TEAM_VIEW',
  TEAM_CREATE: 'TEAM_CREATE',
  TEAM_DELETE: 'TEAM_DELETE',
  TEAM_ADMIN: 'TEAM_ADMIN',
  
  // Task Management
  TASK_VIEW: 'TASK_VIEW',
  TASK_CREATE: 'TASK_CREATE',
  TASK_DELETE: 'TASK_DELETE',
  TASK_ADMIN: 'TASK_ADMIN',
  TASK_TYPE_VIEW: 'TASK_TYPE_VIEW',
  TASK_TYPE_CREATE: 'TASK_TYPE_CREATE',
  TASK_TYPE_DELETE: 'TASK_TYPE_DELETE',
  
  // Project Management
  PROJECT_VIEW: 'PROJECT_VIEW',
  PROJECT_CREATE: 'PROJECT_CREATE',
  PROJECT_DELETE: 'PROJECT_DELETE',
  SPRINT_VIEW: 'SPRINT_VIEW',
  SPRINT_CREATE: 'SPRINT_CREATE',
  SPRINT_DELETE: 'SPRINT_DELETE',
  
  // System Administration
  ADMIN_ACCESS: 'ADMIN_ACCESS',
  SYSTEM_CONFIG: 'SYSTEM_CONFIG',
  SYSTEM_ADMIN: 'SYSTEM_ADMIN'
} as const;

// Type for permission codes
export type PermissionCode = typeof PERMISSION_CODES[keyof typeof PERMISSION_CODES];

// Permission name mappings for UI display
export const PERMISSION_NAMES = {
  [PERMISSION_CODES.DASHBOARD_VIEW]: 'dashboard.read',
  [PERMISSION_CODES.DASHBOARD_ADMIN]: 'dashboard.admin',
  [PERMISSION_CODES.USER_VIEW]: 'users.read',
  [PERMISSION_CODES.USER_CREATE]: 'users.write',
  [PERMISSION_CODES.USER_DELETE]: 'users.delete',
  [PERMISSION_CODES.USER_ADMIN]: 'users.admin',
  [PERMISSION_CODES.ROLE_VIEW]: 'roles.read',
  [PERMISSION_CODES.ROLE_CREATE]: 'roles.write',
  [PERMISSION_CODES.ROLE_DELETE]: 'roles.delete',
  [PERMISSION_CODES.ROLE_ADMIN]: 'roles.admin',
  [PERMISSION_CODES.TEAM_VIEW]: 'teams.read',
  [PERMISSION_CODES.TEAM_CREATE]: 'teams.write',
  [PERMISSION_CODES.TEAM_DELETE]: 'teams.delete',
  [PERMISSION_CODES.TEAM_ADMIN]: 'teams.admin',
  [PERMISSION_CODES.TASK_VIEW]: 'tasks.read',
  [PERMISSION_CODES.TASK_CREATE]: 'tasks.write',
  [PERMISSION_CODES.TASK_DELETE]: 'tasks.delete',
  [PERMISSION_CODES.TASK_ADMIN]: 'tasks.admin',
  [PERMISSION_CODES.TASK_TYPE_VIEW]: 'task-types.read',
  [PERMISSION_CODES.TASK_TYPE_CREATE]: 'task-types.write',
  [PERMISSION_CODES.TASK_TYPE_DELETE]: 'task-types.delete',
  [PERMISSION_CODES.PROJECT_VIEW]: 'projects.read',
  [PERMISSION_CODES.PROJECT_CREATE]: 'projects.write',
  [PERMISSION_CODES.PROJECT_DELETE]: 'projects.delete',
  [PERMISSION_CODES.SPRINT_VIEW]: 'sprints.read',
  [PERMISSION_CODES.SPRINT_CREATE]: 'sprints.write',
  [PERMISSION_CODES.SPRINT_DELETE]: 'sprints.delete',
  [PERMISSION_CODES.ADMIN_ACCESS]: 'admin.access',
  [PERMISSION_CODES.SYSTEM_CONFIG]: 'system.config',
  [PERMISSION_CODES.SYSTEM_ADMIN]: 'system.admin'
};

// Permission descriptions for UI
export const PERMISSION_DESCRIPTIONS = {
  [PERMISSION_CODES.DASHBOARD_VIEW]: 'View dashboard and basic analytics',
  [PERMISSION_CODES.DASHBOARD_ADMIN]: 'Manage dashboard configuration and advanced analytics',
  [PERMISSION_CODES.USER_VIEW]: 'View user profiles and basic information',
  [PERMISSION_CODES.USER_CREATE]: 'Create and edit user accounts',
  [PERMISSION_CODES.USER_DELETE]: 'Delete user accounts and manage user lifecycle',
  [PERMISSION_CODES.USER_ADMIN]: 'Full user management including role assignments',
  [PERMISSION_CODES.ROLE_VIEW]: 'View roles and their permissions',
  [PERMISSION_CODES.ROLE_CREATE]: 'Create and modify roles',
  [PERMISSION_CODES.ROLE_DELETE]: 'Delete roles and manage role lifecycle',
  [PERMISSION_CODES.ROLE_ADMIN]: 'Full role management including permission assignments',
  [PERMISSION_CODES.TEAM_VIEW]: 'View team information and membership',
  [PERMISSION_CODES.TEAM_CREATE]: 'Create and modify teams',
  [PERMISSION_CODES.TEAM_DELETE]: 'Delete teams and manage team lifecycle',
  [PERMISSION_CODES.TEAM_ADMIN]: 'Full team management including member assignments',
  [PERMISSION_CODES.TASK_VIEW]: 'View tasks and task details',
  [PERMISSION_CODES.TASK_CREATE]: 'Create and modify tasks',
  [PERMISSION_CODES.TASK_DELETE]: 'Delete tasks and manage task lifecycle',
  [PERMISSION_CODES.TASK_ADMIN]: 'Full task management including assignments and status changes',
  [PERMISSION_CODES.TASK_TYPE_VIEW]: 'View task types and configurations',
  [PERMISSION_CODES.TASK_TYPE_CREATE]: 'Create and modify task types',
  [PERMISSION_CODES.TASK_TYPE_DELETE]: 'Delete task types and manage task type lifecycle',
  [PERMISSION_CODES.PROJECT_VIEW]: 'View projects and project details',
  [PERMISSION_CODES.PROJECT_CREATE]: 'Create and modify projects',
  [PERMISSION_CODES.PROJECT_DELETE]: 'Delete projects and manage project lifecycle',
  [PERMISSION_CODES.SPRINT_VIEW]: 'View sprints and sprint details',
  [PERMISSION_CODES.SPRINT_CREATE]: 'Create and modify sprints',
  [PERMISSION_CODES.SPRINT_DELETE]: 'Delete sprints and manage sprint lifecycle',
  [PERMISSION_CODES.ADMIN_ACCESS]: 'Access administrative functions and panels',
  [PERMISSION_CODES.SYSTEM_CONFIG]: 'Configure system settings and parameters',
  [PERMISSION_CODES.SYSTEM_ADMIN]: 'Full system administration access'
};