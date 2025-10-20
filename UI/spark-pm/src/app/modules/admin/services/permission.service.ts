import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { map, catchError, tap, finalize, delay } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { 
  Permission, 
  Role, 
  UserRole,
  PermissionRequest,
  RoleRequest,
  GroupedPermissionsDto,
  RolePermissionRequest,
  BulkRolePermissionRequest,
  UserRoleRequest,
  PermissionCheck,
  PermissionCheckResponse,
  ApiResponse,
  PermissionStatistics,
  PermissionAuditLog,
  PagedResponse,
  PermissionMatrix
} from '../../../core/models/permission.model';
import { ResourceType, PermissionAction, PermissionCode, PERMISSION_CODES } from '../../../core/models/permission.constants';

interface PermissionGroup {
  resource: string;
  permissions: Permission[];
  errors?: string[];
}

interface BulkAssignRequest {
  roleId: number;
  permissionIds: number[];
}

interface BulkRevokeRequest {
  roleId: number;
  permissionIds: number[];
}

interface PermissionStats {
  totalPermissions: number;
  totalRoles: number;
  totalAssignments: number;
  resourceGroups: number;
  recentChanges: number;
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private readonly baseUrl = `${environment.apiUrl}/api`;
  private readonly permissionsSubject = new BehaviorSubject<Permission[]>([]);
  private readonly rolesSubject = new BehaviorSubject<Role[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  
  public permissions$ = this.permissionsSubject.asObservable();
  public roles$ = this.rolesSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private http: HttpClient) {
    console.log('🚀 PermissionService constructor - service ready for API calls');
  }

  /**
   * Load mock data for development
   */
  private loadMockData(): { permissions: Permission[], roles: Role[] } {
    const mockPermissions: Permission[] = [
      { 
        id: 1, 
        code: PERMISSION_CODES.DASHBOARD_VIEW,
        name: 'View Dashboard', 
        resource: ResourceType.DASHBOARD, 
        action: PermissionAction.READ, 
        description: 'View main dashboard page',
        active: true,
        systemPermission: true,
        displayOrder: 1
      },
      { 
        id: 2, 
        code: PERMISSION_CODES.DASHBOARD_ADMIN,
        name: 'Admin Dashboard', 
        resource: ResourceType.DASHBOARD, 
        action: PermissionAction.ADMIN, 
        description: 'Modify dashboard settings',
        active: true,
        systemPermission: true,
        displayOrder: 2
      },
      { 
        id: 3, 
        code: PERMISSION_CODES.USER_VIEW,
        name: 'View Users', 
        resource: ResourceType.USERS, 
        action: PermissionAction.READ, 
        description: 'View user list and profiles',
        active: true,
        systemPermission: true,
        displayOrder: 3
      },
      { 
        id: 4, 
        code: PERMISSION_CODES.USER_CREATE,
        name: 'Create User', 
        resource: ResourceType.USERS, 
        action: PermissionAction.WRITE, 
        description: 'Create new user accounts',
        active: true,
        systemPermission: true,
        displayOrder: 4
      },
      { 
        id: 5, 
        code: PERMISSION_CODES.USER_DELETE,
        name: 'Delete User', 
        resource: ResourceType.USERS, 
        action: PermissionAction.DELETE, 
        description: 'Remove user accounts',
        active: true,
        systemPermission: true,
        displayOrder: 5
      },
      { 
        id: 6, 
        code: PERMISSION_CODES.USER_ADMIN,
        name: 'Admin Users', 
        resource: ResourceType.USERS, 
        action: PermissionAction.ADMIN, 
        description: 'Full user administration access',
        active: true,
        systemPermission: true,
        displayOrder: 6
      },
      { 
        id: 7, 
        code: PERMISSION_CODES.ROLE_VIEW,
        name: 'View Roles', 
        resource: ResourceType.ROLES, 
        action: PermissionAction.READ, 
        description: 'View roles and permissions',
        active: true,
        systemPermission: true,
        displayOrder: 7
      },
      { 
        id: 8, 
        code: PERMISSION_CODES.ROLE_ADMIN,
        name: 'Admin Roles', 
        resource: ResourceType.ROLES, 
        action: PermissionAction.ADMIN, 
        description: 'Create and modify roles',
        active: true,
        systemPermission: true,
        displayOrder: 8
      },
      { 
        id: 9, 
        code: PERMISSION_CODES.TEAM_VIEW,
        name: 'View Teams', 
        resource: ResourceType.TEAMS, 
        action: PermissionAction.READ, 
        description: 'View team information',
        active: true,
        systemPermission: true,
        displayOrder: 9
      },
      { 
        id: 10, 
        code: PERMISSION_CODES.TEAM_ADMIN,
        name: 'Admin Teams', 
        resource: ResourceType.TEAMS, 
        action: PermissionAction.ADMIN, 
        description: 'Create and manage teams',
        active: true,
        systemPermission: true,
        displayOrder: 10
      }
    ];

    const mockRoles: Role[] = [
      { 
        id: 1, 
        code: 'SUPER_ADMIN',
        name: 'Super Admin', 
        description: 'Full system access with all permissions',
        permissions: mockPermissions,
        active: true,
        systemRole: true,
        userCount: 1
      },
      { 
        id: 2, 
        code: 'PROJECT_MANAGER',
        name: 'Project Manager', 
        description: 'Manage projects and teams',
        permissions: mockPermissions.filter(p => 
          [ResourceType.DASHBOARD, ResourceType.TEAMS].includes(p.resource) && 
          p.action !== PermissionAction.DELETE
        ),
        active: true,
        systemRole: true,
        userCount: 3
      },
      { 
        id: 3, 
        code: 'TEAM_LEAD',
        name: 'Team Lead', 
        description: 'Lead team activities and view reports',
        permissions: mockPermissions.filter(p => 
          [ResourceType.DASHBOARD, ResourceType.TEAMS].includes(p.resource) && 
          [PermissionAction.READ, PermissionAction.WRITE].includes(p.action)
        ),
        active: true,
        systemRole: true,
        userCount: 5
      },
      { 
        id: 4, 
        code: 'DEVELOPER',
        name: 'Developer', 
        description: 'Standard developer access',
        permissions: mockPermissions.filter(p => 
          [ResourceType.DASHBOARD, ResourceType.TEAMS].includes(p.resource) && 
          [PermissionAction.READ, PermissionAction.WRITE].includes(p.action)
        ),
        active: true,
        systemRole: true,
        userCount: 12
      },
      { 
        id: 5, 
        code: 'VIEWER',
        name: 'Viewer', 
        description: 'Read-only access to most resources',
        permissions: mockPermissions.filter(p => p.action === PermissionAction.READ),
        active: true,
        systemRole: false,
        userCount: 8
      }
    ];

    // Set the mock data in subjects
    this.permissionsSubject.next(mockPermissions);
    this.rolesSubject.next(mockRoles);

    // Return the data for direct access
    return { permissions: mockPermissions, roles: mockRoles };
  }

  // ===========================================
  // PERMISSION OPERATIONS
  // ===========================================

  /**
   * Get all permissions from API
   */
  getAllPermissions(): Observable<Permission[]> {
    console.log('🔍 Calling permissions API:', `${this.baseUrl}/permissions`);
    this.loadingSubject.next(true);
    
    return this.http.get<Permission[]>(`${this.baseUrl}/permissions`, this.httpOptions)
      .pipe(
        tap(response => {
          console.log('📥 Permissions API response:', response?.length || 0, 'items');
          this.permissionsSubject.next(response || []);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          console.error('❌ Permissions API error:', error);
          this.loadingSubject.next(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Load and cache permissions
   */
  loadPermissions(): Observable<Permission[]> {
    return this.getAllPermissions();
  }

  /**
   * Get permission by ID
   */
  getPermissionById(id: number): Observable<Permission | null> {
    return this.http.get<ApiResponse<Permission>>(`${this.baseUrl}/permissions/${id}`, this.httpOptions)
      .pipe(
        map(response => response.data || null),
        catchError(this.handleError<Permission | null>('getPermissionById', null))
      );
  }

  /**
   * Create a new permission
   */
  createPermission(permission: Omit<Permission, 'id'>): Observable<Permission> {
    return this.http.post<ApiResponse<Permission>>(`${this.baseUrl}/permissions`, permission, this.httpOptions)
      .pipe(
        map(response => {
          if (!response.data) throw new Error('Permission creation failed');
          return response.data;
        }),
        tap(() => this.refreshPermissions()),
        catchError(this.handleError<Permission>('createPermission'))
      );
  }

  /**
   * Update an existing permission
   */
  updatePermission(id: number, permission: Partial<Permission>): Observable<Permission> {
    return this.http.put<ApiResponse<Permission>>(`${this.baseUrl}/permissions/${id}`, permission, this.httpOptions)
      .pipe(
        map(response => {
          if (!response.data) throw new Error('Permission update failed');
          return response.data;
        }),
        tap(() => this.refreshPermissions()),
        catchError(this.handleError<Permission>('updatePermission'))
      );
  }

  /**
   * Delete a permission
   */
  deletePermission(id: number): Observable<boolean> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/permissions/${id}`, this.httpOptions)
      .pipe(
        map(response => response.success),
        tap(() => this.refreshPermissions()),
        catchError(this.handleError<boolean>('deletePermission', false))
      );
  }

  // ===========================================
  // ROLE OPERATIONS
  // ===========================================

  /**
   * Get all roles
   */
  /**
   * Get all roles from API
   */
  getAllRoles(): Observable<Role[]> {
    console.log('🔍 Calling roles API:', `${this.baseUrl}/roles`);
    this.loadingSubject.next(true);
    
    return this.http.get<Role[]>(`${this.baseUrl}/roles`, this.httpOptions)
      .pipe(
        tap(response => {
          console.log('📥 Roles API response:', response?.length || 0, 'items');
          this.rolesSubject.next(response || []);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          console.error('❌ Roles API error:', error);
          this.loadingSubject.next(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Load and cache roles
   */
  loadRoles(): Observable<Role[]> {
    return this.getAllRoles();
  }

  /**
   * Get role by ID with permissions
   */
  getRoleById(id: number): Observable<Role | null> {
    return this.http.get<ApiResponse<Role>>(`${this.baseUrl}/roles/${id}`, this.httpOptions)
      .pipe(
        map(response => response.data || null),
        catchError(this.handleError<Role | null>('getRoleById', null))
      );
  }

  /**
   * Create a new role
   */
  createRole(role: Omit<Role, 'id'>): Observable<Role> {
    return this.http.post<ApiResponse<Role>>(`${this.baseUrl}/roles`, role, this.httpOptions)
      .pipe(
        map(response => {
          if (!response.data) throw new Error('Role creation failed');
          return response.data;
        }),
        tap(() => this.refreshRoles()),
        catchError(this.handleError<Role>('createRole'))
      );
  }

  /**
   * Update an existing role
   */
  updateRole(id: number, role: Partial<Role>): Observable<Role> {
    return this.http.put<ApiResponse<Role>>(`${this.baseUrl}/roles/${id}`, role, this.httpOptions)
      .pipe(
        map(response => {
          if (!response.data) throw new Error('Role update failed');
          return response.data;
        }),
        tap(() => this.refreshRoles()),
        catchError(this.handleError<Role>('updateRole'))
      );
  }

  /**
   * Delete a role
   */
  deleteRole(id: number): Observable<boolean> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/roles/${id}`, this.httpOptions)
      .pipe(
        map(response => response.success),
        tap(() => this.refreshRoles()),
        catchError(this.handleError<boolean>('deleteRole', false))
      );
  }

  // ===========================================
  // ROLE-PERMISSION ASSIGNMENT OPERATIONS
  // ===========================================

  /**
   * Get permissions for a specific role
   */
  getRolePermissions(roleId: number): Observable<Permission[]> {
    // Call the real API - handle direct array response
    return this.http.get<Permission[]>(`${this.baseUrl}/roles/${roleId}/permissions`, this.httpOptions)
      .pipe(
        map(response => Array.isArray(response) ? response : []),
        catchError(this.handleError<Permission[]>('getRolePermissions', []))
      );
  }

  /**
   * Assign a permission to a role
   */
  assignPermissionToRole(roleId: number, permissionId: number): Observable<boolean> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/roles/${roleId}/permissions/${permissionId}`,
      {},
      this.httpOptions
    ).pipe(
      map(response => response.success),
      tap(() => this.refreshRoles()),
      catchError(this.handleError<boolean>('assignPermissionToRole', false))
    );
  }

  /**
   * Revoke a permission from a role
   */
  revokePermissionFromRole(roleId: number, permissionId: number): Observable<boolean> {
    return this.http.delete<ApiResponse<any>>(
      `${this.baseUrl}/roles/${roleId}/permissions/${permissionId}`,
      this.httpOptions
    ).pipe(
      map(response => response.success),
      tap(() => this.refreshRoles()),
      catchError(this.handleError<boolean>('revokePermissionFromRole', false))
    );
  }

  /**
   * Bulk assign permissions to a role
   */
  bulkAssignPermissions(request: BulkAssignRequest): Observable<boolean> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/roles/${request.roleId}/permissions/bulk-assign`,
      { permissionIds: request.permissionIds },
      this.httpOptions
    ).pipe(
      map(response => response.success),
      tap(() => this.refreshRoles()),
      catchError(this.handleError<boolean>('bulkAssignPermissions', false))
    );
  }

  /**
   * Bulk revoke permissions from a role
   */
  bulkRevokePermissions(request: BulkRevokeRequest): Observable<boolean> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/roles/${request.roleId}/permissions/bulk-revoke`,
      { permissionIds: request.permissionIds },
      this.httpOptions
    ).pipe(
      map(response => response.success),
      tap(() => this.refreshRoles()),
      catchError(this.handleError<boolean>('bulkRevokePermissions', false))
    );
  }

  // ===========================================
  // PERMISSION MATRIX OPERATIONS
  // ===========================================

  /**
   * Get the complete permission matrix
   */
  getPermissionMatrix(): Observable<PermissionMatrix> {
    return this.http.get<ApiResponse<PermissionMatrix>>(`${this.baseUrl}/permissions/matrix`, this.httpOptions)
      .pipe(
        map(response => response.data || this.createEmptyMatrix()),
        catchError(() => this.createPermissionMatrix())
      );
  }

  /**
   * Create permission matrix from existing data
   */
  createPermissionMatrix(): Observable<PermissionMatrix> {
    return this.http.get<ApiResponse<PermissionMatrix>>(`${this.baseUrl}/permissions/matrix/generate`, this.httpOptions)
      .pipe(
        map(response => {
          if (response.data) {
            return response.data;
          }
          return this.createEmptyMatrix();
        }),
        catchError(() => of(this.createEmptyMatrix()))
      );
  }

  /**
   * Update permission matrix (bulk update)
   */
  updatePermissionMatrix(matrix: PermissionMatrix): Observable<boolean> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/permissions/matrix/update`,
      matrix,
      this.httpOptions
    ).pipe(
      map(response => response.success),
      tap(() => {
        this.refreshRoles();
        this.refreshPermissions();
      }),
      catchError(this.handleError<boolean>('updatePermissionMatrix', false))
    );
  }

  // ===========================================
  // UTILITY AND HELPER METHODS
  // ===========================================

  /**
   * Group permissions by resource
   */
  getPermissionGroups(): Observable<PermissionGroup[]> {
    return this.permissions$.pipe(
      map(permissions => {
        const groups = new Map<string, Permission[]>();
        
        permissions.forEach(permission => {
          const resource = permission.resource || 'Other';
          if (!groups.has(resource)) {
            groups.set(resource, []);
          }
          groups.get(resource)!.push(permission);
        });

        return Array.from(groups.entries()).map(([resource, permissions]) => ({
          resource,
          permissions: permissions.sort((a, b) => a.action.localeCompare(b.action))
        })).sort((a, b) => a.resource.localeCompare(b.resource));
      })
    );
  }

  /**
   * Get permission statistics
   */
  getPermissionStats(): Observable<PermissionStats> {
    // Call the real API for statistics - use /statistics endpoint
    return this.http.get<any>(`${this.baseUrl}/permissions/statistics`, this.httpOptions)
      .pipe(
        map(response => ({
          totalPermissions: response.totalPermissions || 0,
          totalRoles: response.totalRoles || 0,
          totalAssignments: response.totalAssignments || 0,
          resourceGroups: response.resourceGroups || 0,
          recentChanges: response.recentChanges || 0
        })),
        catchError(this.handleError<PermissionStats>('getPermissionStats', {
          totalPermissions: 0,
          totalRoles: 0,
          totalAssignments: 0,
          resourceGroups: 0,
          recentChanges: 0
        }))
      );
  }

  /**
   * Search permissions by term
   */
  searchPermissions(searchTerm: string): Observable<Permission[]> {
    if (!searchTerm.trim()) {
      return this.permissions$;
    }

    const params = new HttpParams().set('q', searchTerm.trim());
    return this.http.get<ApiResponse<Permission[]>>(`${this.baseUrl}/permissions/search`, {
      ...this.httpOptions,
      params
    }).pipe(
      map(response => response.data || []),
      catchError(() => 
        this.permissions$.pipe(
          map(permissions => 
            permissions.filter(p => 
              p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              p.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
              p.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
            )
          )
        )
      )
    );
  }

  /**
   * Search roles by term
   */
  searchRoles(searchTerm: string): Observable<Role[]> {
    if (!searchTerm.trim()) {
      return this.roles$;
    }

    const params = new HttpParams().set('q', searchTerm.trim());
    return this.http.get<ApiResponse<Role[]>>(`${this.baseUrl}/roles/search`, {
      ...this.httpOptions,
      params
    }).pipe(
      map(response => response.data || []),
      catchError(() => 
        this.roles$.pipe(
          map(roles => 
            roles.filter(r => 
              r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()))
            )
          )
        )
      )
    );
  }

  /**
   * Refresh permissions data
   */
  refreshPermissions(): void {
    this.getAllPermissions().subscribe();
  }

  /**
   * Refresh roles data
   */
  refreshRoles(): void {
    this.getAllRoles().subscribe();
  }

  /**
   * Refresh all data
   */
  refreshAll(): void {
    this.refreshPermissions();
    this.refreshRoles();
  }

  // ===========================================
  // PRIVATE HELPER METHODS
  // ===========================================

  /**
   * Create an empty permission matrix
   */
  private createEmptyMatrix(): PermissionMatrix {
    return {
      roles: this.rolesSubject.value,
      permissions: this.permissionsSubject.value,
      assignments: {}
    };
  }

  /**
   * Generic error handler
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      
      let errorMessage = 'An unexpected error occurred';
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      if (result !== undefined) {
        return of(result as T);
      }

      return throwError(() => new Error(errorMessage));
    };
  }


}