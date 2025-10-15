import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { map, catchError, tap, finalize, delay } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

// Import models (these should be created based on the backend DTOs)
interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface Role {
  id: number;
  name: string;
  description?: string;
  permissions?: Permission[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface User {
  id: number;
  username: string;
  email: string;
  roles?: Role[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface PermissionMatrix {
  roles: Role[];
  permissions: Permission[];
  assignments: { [roleId: number]: { [permissionId: number]: boolean } };
}

interface PermissionGroup {
  resource: string;
  permissions: Permission[];
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
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
    this.initializeData();
  }

  /**
   * Initialize service by loading basic data
   */
  private initializeData(): void {
    // Load real data from backend API
    this.loadPermissions().subscribe({
      next: (permissions) => console.log('Permissions loaded:', permissions.length),
      error: (error) => {
        console.error('Failed to load permissions:', error);
        // Fallback to mock data if API fails
        this.loadMockData();
      }
    });
    
    this.loadRoles().subscribe({
      next: (roles) => console.log('Roles loaded:', roles.length),
      error: (error) => {
        console.error('Failed to load roles:', error);
        // Fallback to mock data if API fails
        this.loadMockData();
      }
    });
  }

  /**
   * Load mock data for development
   */
  private loadMockData(): { permissions: Permission[], roles: Role[] } {
    const mockPermissions: Permission[] = [
      { id: 1, name: 'View Dashboard', resource: 'Dashboard', action: 'view', description: 'View main dashboard page' },
      { id: 2, name: 'Edit Dashboard', resource: 'Dashboard', action: 'edit', description: 'Modify dashboard settings' },
      { id: 3, name: 'View Users', resource: 'Users', action: 'view', description: 'View user list and profiles' },
      { id: 4, name: 'Create User', resource: 'Users', action: 'create', description: 'Create new user accounts' },
      { id: 5, name: 'Edit User', resource: 'Users', action: 'edit', description: 'Modify user information' },
      { id: 6, name: 'Delete User', resource: 'Users', action: 'delete', description: 'Remove user accounts' },
      { id: 7, name: 'View Roles', resource: 'Roles', action: 'view', description: 'View roles and permissions' },
      { id: 8, name: 'Manage Roles', resource: 'Roles', action: 'manage', description: 'Create and modify roles' },
      { id: 9, name: 'View Teams', resource: 'Teams', action: 'view', description: 'View team information' },
      { id: 10, name: 'Manage Teams', resource: 'Teams', action: 'manage', description: 'Create and manage teams' },
      { id: 11, name: 'View Projects', resource: 'Projects', action: 'view', description: 'View project details' },
      { id: 12, name: 'Create Project', resource: 'Projects', action: 'create', description: 'Create new projects' },
      { id: 13, name: 'Edit Project', resource: 'Projects', action: 'edit', description: 'Modify project settings' },
      { id: 14, name: 'Delete Project', resource: 'Projects', action: 'delete', description: 'Remove projects' },
      { id: 15, name: 'View Tasks', resource: 'Tasks', action: 'view', description: 'View task information' },
      { id: 16, name: 'Create Task', resource: 'Tasks', action: 'create', description: 'Create new tasks' },
      { id: 17, name: 'Edit Task', resource: 'Tasks', action: 'edit', description: 'Modify task details' },
      { id: 18, name: 'Delete Task', resource: 'Tasks', action: 'delete', description: 'Remove tasks' },
      { id: 19, name: 'Admin Access', resource: 'Admin', action: 'access', description: 'Access admin panel' },
      { id: 20, name: 'System Settings', resource: 'Admin', action: 'settings', description: 'Modify system settings' }
    ];

    const mockRoles: Role[] = [
      { 
        id: 1, 
        name: 'Super Admin', 
        description: 'Full system access with all permissions',
        permissions: mockPermissions // Super admin has all permissions
      },
      { 
        id: 2, 
        name: 'Project Manager', 
        description: 'Manage projects and teams',
        permissions: mockPermissions.filter(p => 
          ['Dashboard', 'Projects', 'Teams', 'Tasks'].includes(p.resource) && 
          !p.action.includes('delete')
        )
      },
      { 
        id: 3, 
        name: 'Team Lead', 
        description: 'Lead team activities and view reports',
        permissions: mockPermissions.filter(p => 
          ['Dashboard', 'Teams', 'Tasks'].includes(p.resource) && 
          ['view', 'edit', 'create'].includes(p.action)
        )
      },
      { 
        id: 4, 
        name: 'Developer', 
        description: 'Standard developer access',
        permissions: mockPermissions.filter(p => 
          ['Dashboard', 'Projects', 'Tasks'].includes(p.resource) && 
          ['view', 'edit'].includes(p.action)
        )
      },
      { 
        id: 5, 
        name: 'Viewer', 
        description: 'Read-only access to most resources',
        permissions: mockPermissions.filter(p => p.action === 'view')
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
   * Get all permissions
   */
  getAllPermissions(): Observable<Permission[]> {
    console.log('🔍 getAllPermissions called, API URL:', `${this.baseUrl}/permissions`);
    this.loadingSubject.next(true);
    
    // Call the real API - handle direct array response
    return this.http.get<Permission[]>(`${this.baseUrl}/permissions`, this.httpOptions)
      .pipe(
        tap(response => console.log('📥 Permissions API response:', response)),
        map(response => Array.isArray(response) ? response : []),
        tap(permissions => {
          console.log('✅ Processed permissions:', permissions.length);
          this.permissionsSubject.next(permissions);
        }),
        catchError(error => {
          console.error('❌ Permissions API error:', error);
          return this.handleError<Permission[]>('getAllPermissions', [])(error);
        }),
        finalize(() => this.loadingSubject.next(false))
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
  getAllRoles(): Observable<Role[]> {
    console.log('🔍 getAllRoles called, API URL:', `${this.baseUrl}/roles`);
    this.loadingSubject.next(true);
    
    // Call the real API - using /roles endpoint as requested
    return this.http.get<Role[]>(`${this.baseUrl}/roles`, this.httpOptions)
      .pipe(
        tap(response => console.log('📥 Roles API response:', response)),
        map(response => Array.isArray(response) ? response : []),
        tap(roles => {
          console.log('✅ Processed roles:', roles.length);
          this.rolesSubject.next(roles);
        }),
        catchError(error => {
          console.error('❌ Roles API error:', error);
          return this.handleError<Role[]>('getAllRoles', [])(error);
        }),
        finalize(() => this.loadingSubject.next(false))
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