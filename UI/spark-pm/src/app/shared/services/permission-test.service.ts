import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  Permission,
  PermissionSummary,
  PermissionAction,
  PermissionCategory,
  ResourceType,
  PERMISSION_CODES,
  PERMISSION_NAMES,
  DEFAULT_ROLES
} from '../models';

/**
 * Permission service for testing TypeScript models
 * This validates that all interfaces work correctly with Angular services
 */
@Injectable({
  providedIn: 'root'
})
export class PermissionTestService {

  /**
   * Test method to validate Permission interface
   */
  createTestPermission(): Permission {
    return {
      id: 1,
      code: PERMISSION_CODES.USER_VIEW,
      name: PERMISSION_NAMES[PERMISSION_CODES.USER_VIEW],
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
  }

  /**
   * Test method to validate PermissionSummary interface
   */
  createTestPermissionSummary(): PermissionSummary {
    return {
      id: 1,
      code: PERMISSION_CODES.DASHBOARD_VIEW,
      name: PERMISSION_NAMES[PERMISSION_CODES.DASHBOARD_VIEW],
      description: 'Access Dashboard',
      category: PermissionCategory.DASHBOARD,
      active: true
    };
  }

  /**
   * Test method to simulate API response
   */
  getPermissions(): Observable<Permission[]> {
    const permissions: Permission[] = [
      this.createTestPermission(),
      {
        id: 2,
        code: PERMISSION_CODES.ROLE_CREATE,
        name: PERMISSION_NAMES[PERMISSION_CODES.ROLE_CREATE],
        description: 'Create/Edit Roles',
        resource: ResourceType.ROLES,
        action: PermissionAction.WRITE,
        category: PermissionCategory.ROLE_MANAGEMENT,
        displayOrder: 301,
        active: true,
        systemPermission: true,
        createdAt: new Date(),
        createdBy: 'SYSTEM'
      }
    ];
    
    return of(permissions);
  }

  /**
   * Test method to validate enum usage
   */
  getPermissionsByCategory(category: PermissionCategory): Observable<Permission[]> {
    return new Observable(observer => {
      this.getPermissions().subscribe(permissions => {
        const filtered = permissions.filter(p => p.category === category);
        observer.next(filtered);
        observer.complete();
      });
    });
  }

  /**
   * Test method to validate type safety
   */
  validatePermissionCode(code: string): boolean {
    // This demonstrates compile-time type checking
    const validCodes = Object.values(PERMISSION_CODES) as string[];
    return validCodes.includes(code);
  }

  /**
   * Test method to demonstrate proper typing in Angular
   */
  processPermissionData(permissions: Permission[]): PermissionSummary[] {
    return permissions.map(permission => ({
      id: permission.id,
      code: permission.code,
      name: permission.name,
      description: permission.description,
      category: permission.category,
      active: permission.active
    }));
  }

  /**
   * Test method for role validation
   */
  isValidRole(roleName: string): boolean {
    return Object.values(DEFAULT_ROLES).includes(roleName as any);
  }

  /**
   * Test method to demonstrate enum iteration
   */
  getAllCategories(): PermissionCategory[] {
    return Object.values(PermissionCategory);
  }

  /**
   * Test method to demonstrate enum mapping
   */
  getCategoryDisplayNames(): { [key in PermissionCategory]: string } {
    return {
      [PermissionCategory.DASHBOARD]: 'Dashboard',
      [PermissionCategory.USER_MANAGEMENT]: 'User Management',
      [PermissionCategory.ROLE_MANAGEMENT]: 'Role Management',
      [PermissionCategory.TEAM_MANAGEMENT]: 'Team Management',
      [PermissionCategory.TASK_MANAGEMENT]: 'Task Management',
      [PermissionCategory.PROJECT_MANAGEMENT]: 'Project Management',
      [PermissionCategory.SYSTEM_ADMIN]: 'System Administration'
    };
  }

  /**
   * Validation test that runs all type checks
   */
  runValidationTests(): { success: boolean; message: string } {
    try {
      // Test 1: Create permission object
      const permission = this.createTestPermission();
      if (!permission.id || !permission.code) {
        throw new Error('Permission creation failed');
      }

      // Test 2: Test enum values
      const categories = this.getAllCategories();
      if (categories.length === 0) {
        throw new Error('Categories not loaded');
      }

      // Test 3: Test type validation
      const isValidCode = this.validatePermissionCode(PERMISSION_CODES.USER_VIEW);
      if (!isValidCode) {
        throw new Error('Permission code validation failed');
      }

      // Test 4: Test array processing
      const summaries = this.processPermissionData([permission]);
      if (summaries.length !== 1) {
        throw new Error('Array processing failed');
      }

      return {
        success: true,
        message: 'All validation tests passed successfully!'
      };
    } catch (error) {
      return {
        success: false,
        message: `Validation failed: ${error}`
      };
    }
  }
}