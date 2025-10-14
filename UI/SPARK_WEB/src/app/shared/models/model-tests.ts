/**
 * TypeScript Model Validation Tests
 * This file serves as a compile-time test to ensure all interfaces work correctly
 */

import {
  // Constants and enums
  PermissionAction,
  PermissionCategory,
  ResourceType,
  PERMISSION_CODES,
  PermissionCode,
  PERMISSION_NAMES,
  CATEGORY_DISPLAY_NAMES,
  DEFAULT_ROLES,
  DefaultRoleName,
  
  // Permission models
  Permission,
  PermissionRequest,
  PermissionWithState,
  PermissionSummary,
  GroupedPermissions,
  PermissionCheckRequest,
  PermissionCheckResponse,
  BulkPermissionRequest,
  BulkPermissionResponse,
  
  // Role models
  Role,
  RoleWithPermissions,
  RoleWithPermissionSummaries,
  RoleRequest,
  RoleWithState,
  RoleSummary,
  RoleAssignment,
  RoleAssignmentRequest,
  BulkRoleRequest,
  BulkRoleResponse,
  RoleHierarchy,
  RoleStatistics,
  
  // User models
  User,
  UserWithRoles,
  UserWithPermissions,
  UserSummary,
  UserRequest,
  UserProfile,
  UserPreferences,
  NotificationPreferences,
  UserActivity,
  UserSettings,
  UserStatistics,
  UserSearchCriteria,
  
  // Junction models
  RolePermission,
  RolePermissionWithDetails,
  RolePermissionRequest,
  BulkRolePermissionRequest,
  BulkRolePermissionResponse,
  UserRole,
  UserRoleWithDetails,
  UserRoleRequest,
  BulkUserRoleRequest,
  BulkUserRoleResponse,
  PermissionInheritance,
  UserEffectivePermissions,
  PermissionMatrix
} from './index';

/**
 * Test function to validate all model interfaces compile correctly
 */
export function validateModels(): void {
  console.log('🚀 Starting TypeScript Model Validation Tests...');
  
  // Test Permission Constants
  testPermissionConstants();
  
  // Test Permission Models
  testPermissionModels();
  
  // Test Role Models
  testRoleModels();
  
  // Test User Models
  testUserModels();
  
  // Test Junction Models
  testJunctionModels();
  
  console.log('✅ All TypeScript model validation tests passed!');
}

function testPermissionConstants(): void {
  console.log('📋 Testing Permission Constants...');
  
  // Test enums
  const action: PermissionAction = PermissionAction.READ;
  const category: PermissionCategory = PermissionCategory.USER_MANAGEMENT;
  const resource: ResourceType = ResourceType.USERS;
  
  // Test permission codes
  const permCode: PermissionCode = PERMISSION_CODES.USER_VIEW;
  const permName = PERMISSION_NAMES[PERMISSION_CODES.USER_VIEW];
  const categoryName = CATEGORY_DISPLAY_NAMES[PermissionCategory.USER_MANAGEMENT];
  
  // Test role constants
  const roleName: DefaultRoleName = DEFAULT_ROLES.ADMIN;
  
  console.log(`✓ Permission constants validated: ${action}, ${category}, ${resource}, ${permCode}, ${permName}, ${categoryName}, ${roleName}`);
}

function testPermissionModels(): void {
  console.log('🔑 Testing Permission Models...');
  
  // Test Permission interface
  const permission: Permission = {
    id: 1,
    code: PERMISSION_CODES.USER_VIEW,
    name: 'users.read',
    description: 'View Users',
    resource: ResourceType.USERS,
    action: PermissionAction.READ,
    category: PermissionCategory.USER_MANAGEMENT,
    displayOrder: 200,
    active: true,
    systemPermission: true,
    createdAt: new Date(),
    createdBy: 'SYSTEM'
  };
  
  // Test PermissionRequest
  const permRequest: PermissionRequest = {
    code: 'CUSTOM_PERMISSION',
    name: 'custom.permission',
    description: 'Custom permission',
    resource: 'custom',
    action: PermissionAction.READ,
    active: true
  };
  
  // Test PermissionWithState
  const permWithState: PermissionWithState = {
    ...permission,
    selected: true,
    loading: false,
    expanded: false
  };
  
  // Test GroupedPermissions
  const groupedPerms: GroupedPermissions = {
    category: PermissionCategory.USER_MANAGEMENT,
    displayName: 'User Management',
    permissions: [permission],
    count: 1,
    activeCount: 1
  };
  
  console.log(`✓ Permission models validated: ${permission.code}, ${permRequest.code}, ${permWithState.selected}, ${groupedPerms.count}`);
}

function testRoleModels(): void {
  console.log('👥 Testing Role Models...');
  
  // Test Role interface
  const role: Role = {
    id: 1,
    name: 'ADMIN',
    description: 'Administrator role',
    displayName: 'Administrator',
    color: '#dc2626',
    priority: 100,
    active: true,
    systemRole: true,
    createdAt: new Date(),
    createdBy: 'SYSTEM'
  };
  
  // Test RoleRequest
  const roleRequest: RoleRequest = {
    name: 'CUSTOM_ROLE',
    description: 'Custom role',
    displayName: 'Custom Role',
    color: '#3b82f6',
    priority: 50,
    active: true,
    permissionIds: [1, 2, 3]
  };
  
  // Test RoleAssignment
  const roleAssignment: RoleAssignment = {
    id: 1,
    userId: 1,
    roleId: 1,
    role: {
      id: 1,
      name: 'ADMIN',
      displayName: 'Administrator',
      description: 'Administrator role',
      active: true,
      systemRole: true
    },
    assignedAt: new Date(),
    assignedBy: 'SYSTEM',
    active: true,
    isPrimary: true
  };
  
  console.log(`✓ Role models validated: ${role.name}, ${roleRequest.name}, ${roleAssignment.isPrimary}`);
}

function testUserModels(): void {
  console.log('👤 Testing User Models...');
  
  // Test User interface
  const user: User = {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    fullName: 'Admin User',
    active: true,
    verified: true,
    createdAt: new Date(),
    createdBy: 'SYSTEM'
  };
  
  // Test UserRequest
  const userRequest: UserRequest = {
    username: 'newuser',
    email: 'newuser@example.com',
    firstName: 'New',
    lastName: 'User',
    password: 'password123',
    active: true,
    roleIds: [1, 2]
  };
  
  // Test UserPreferences
  const userPrefs: UserPreferences = {
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'DD/MM/YYYY',
    notifications: {
      email: true,
      browser: true,
      mobile: false,
      types: {
        taskAssigned: true,
        taskUpdated: true,
        teamInvitation: true,
        projectUpdates: false,
        systemAlerts: true
      }
    }
  };
  
  console.log(`✓ User models validated: ${user.username}, ${userRequest.username}, ${userPrefs.theme}`);
}

function testJunctionModels(): void {
  console.log('🔗 Testing Junction Models...');
  
  // Test RolePermission
  const rolePermission: RolePermission = {
    id: 1,
    roleId: 1,
    permissionId: 1,
    grantedAt: new Date(),
    grantedBy: 'SYSTEM',
    active: true
  };
  
  // Test UserRole
  const userRole: UserRole = {
    id: 1,
    userId: 1,
    roleId: 1,
    assignedAt: new Date(),
    assignedBy: 'SYSTEM',
    active: true,
    isPrimary: true
  };
  
  // Test BulkRolePermissionRequest
  const bulkRequest: BulkRolePermissionRequest = {
    roleId: 1,
    permissionIds: [1, 2, 3],
    operation: 'assign',
    notes: 'Bulk assignment'
  };
  
  console.log(`✓ Junction models validated: ${rolePermission.active}, ${userRole.isPrimary}, ${bulkRequest.operation}`);
}

/**
 * Runtime test to verify model instantiation
 */
export function runRuntimeTests(): boolean {
  try {
    console.log('🔄 Running runtime model instantiation tests...');
    
    // Test creating objects with proper typing
    const testPermission: Permission = {
      id: 1,
      code: PERMISSION_CODES.DASHBOARD_VIEW,
      name: PERMISSION_NAMES[PERMISSION_CODES.DASHBOARD_VIEW],
      description: 'Dashboard access',
      resource: ResourceType.DASHBOARD,
      action: PermissionAction.READ,
      category: PermissionCategory.DASHBOARD,
      active: true,
      systemPermission: true
    };
    
    const testRole: Role = {
      id: 1,
      name: DEFAULT_ROLES.ADMIN,
      description: 'System administrator',
      active: true,
      systemRole: true
    };
    
    // Test type checking
    const isValidPermission = testPermission.code === PERMISSION_CODES.DASHBOARD_VIEW;
    const isValidRole = testRole.name === DEFAULT_ROLES.ADMIN;
    
    if (!isValidPermission || !isValidRole) {
      throw new Error('Type validation failed');
    }
    
    console.log('✅ Runtime tests passed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Runtime tests failed:', error);
    return false;
  }
}

/**
 * Test helper to validate API response typing
 */
export function testApiResponseTyping(): void {
  console.log('🌐 Testing API response typing...');
  
  // Simulate API response
  const apiResponse: Permission[] = [
    {
      id: 1,
      code: PERMISSION_CODES.USER_VIEW,
      name: PERMISSION_NAMES[PERMISSION_CODES.USER_VIEW],
      description: 'View users',
      resource: ResourceType.USERS,
      action: PermissionAction.READ,
      active: true,
      systemPermission: true
    }
  ];
  
  // Test array methods with proper typing
  const activePermissions = apiResponse.filter(p => p.active);
  const permissionCodes = apiResponse.map(p => p.code);
  const userPermissions = apiResponse.filter(p => p.resource === ResourceType.USERS);
  
  console.log(`✓ API response typing validated: ${activePermissions.length}, ${permissionCodes.length}, ${userPermissions.length}`);
}

// Export test runner
export default {
  validateModels,
  runRuntimeTests,
  testApiResponseTyping
};