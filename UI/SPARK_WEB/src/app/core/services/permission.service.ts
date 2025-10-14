import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  Permission, 
  Role, 
  RolePermission,
  PermissionRequest,
  GroupedPermissionsDto,
  BulkPermissionRequest,
  RolePermissionRequest,
  BulkRolePermissionRequest,
  PermissionCheckRequest,
  PermissionCheckResponse
} from '../models/permission.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private apiUrl = `${environment.apiUrl}/api`;
  private permissionsSubject = new BehaviorSubject<Permission[]>([]);
  private rolesSubject = new BehaviorSubject<Role[]>([]);
  
  public permissions$ = this.permissionsSubject.asObservable();
  public roles$ = this.rolesSubject.asObservable();

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  // Permission Management
  getAllPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.apiUrl}/permissions`, this.httpOptions)
      .pipe(tap(permissions => this.permissionsSubject.next(permissions)));
  }

  getActivePermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.apiUrl}/permissions/active`, this.httpOptions);
  }

  getPermissionById(id: number): Observable<Permission> {
    return this.http.get<Permission>(`${this.apiUrl}/permissions/${id}`, this.httpOptions);
  }

  getPermissionByCode(code: string): Observable<Permission> {
    return this.http.get<Permission>(`${this.apiUrl}/permissions/code/${code}`, this.httpOptions);
  }

  getPermissionsByCategory(category: string): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.apiUrl}/permissions/category/${category}`, this.httpOptions);
  }

  getPermissionsByResource(resource: string): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.apiUrl}/permissions/resource/${resource}`, this.httpOptions);
  }

  searchPermissions(query: string): Observable<Permission[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<Permission[]>(`${this.apiUrl}/permissions/search`, { ...this.httpOptions, params });
  }

  getGroupedPermissions(): Observable<GroupedPermissionsDto[]> {
    return this.http.get<GroupedPermissionsDto[]>(`${this.apiUrl}/permissions/grouped`, this.httpOptions);
  }

  getPermissionStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/permissions/statistics`, this.httpOptions);
  }

  getPermissionMetadata(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/permissions/metadata`, this.httpOptions);
  }

  getUnassignedPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.apiUrl}/permissions/unassigned`, this.httpOptions);
  }

  createPermission(permission: PermissionRequest): Observable<Permission> {
    return this.http.post<Permission>(`${this.apiUrl}/permissions`, permission, this.httpOptions)
      .pipe(tap(() => this.refreshPermissions()));
  }

  updatePermission(id: number, permission: PermissionRequest): Observable<Permission> {
    return this.http.put<Permission>(`${this.apiUrl}/permissions/${id}`, permission, this.httpOptions)
      .pipe(tap(() => this.refreshPermissions()));
  }

  deletePermission(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/permissions/${id}`, this.httpOptions)
      .pipe(tap(() => this.refreshPermissions()));
  }

  togglePermissionStatus(id: number): Observable<Permission> {
    return this.http.put<Permission>(`${this.apiUrl}/permissions/${id}/toggle`, {}, this.httpOptions)
      .pipe(tap(() => this.refreshPermissions()));
  }

  bulkPermissionOperation(request: BulkPermissionRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/permissions/bulk`, request, this.httpOptions)
      .pipe(tap(() => this.refreshPermissions()));
  }

  // Role-Permission Management
  getRolePermissions(roleId: number): Observable<RolePermission[]> {
    return this.http.get<RolePermission[]>(`${this.apiUrl}/role-permissions/role/${roleId}`, this.httpOptions);
  }

  assignPermissionToRole(request: RolePermissionRequest): Observable<RolePermission> {
    return this.http.post<RolePermission>(`${this.apiUrl}/role-permissions/assign`, request, this.httpOptions);
  }

  revokePermissionFromRole(request: RolePermissionRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/role-permissions/revoke`, request, this.httpOptions);
  }

  bulkAssignPermissions(request: BulkRolePermissionRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/role-permissions/bulk-assign`, request, this.httpOptions);
  }

  bulkRevokePermissions(request: BulkRolePermissionRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/role-permissions/bulk-revoke`, request, this.httpOptions);
  }

  replaceRolePermissions(roleId: number, permissionIds: number[], grantedBy: string, notes?: string): Observable<any> {
    const request = {
      permissionIds,
      grantedBy,
      notes: notes || `Bulk permission update for role ${roleId}`
    };
    return this.http.put<any>(`${this.apiUrl}/role-permissions/replace/${roleId}`, request, this.httpOptions);
  }

  getRolePermissionsSummary(roleId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/role-permissions/role/${roleId}/summary`, this.httpOptions);
  }

  getRolePermissionsDetails(roleId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/role-permissions/role/${roleId}/details`, this.httpOptions);
  }

  // Permission Checking
  checkUserPermission(request: PermissionCheckRequest): Observable<PermissionCheckResponse> {
    return this.http.post<PermissionCheckResponse>(`${this.apiUrl}/permissions/check`, request, this.httpOptions);
  }

  // Role Management (assuming roles API exists)
  getAllRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/roles`, this.httpOptions)
      .pipe(tap(roles => this.rolesSubject.next(roles)));
  }

  getRoleById(id: number): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/roles/${id}`, this.httpOptions);
  }

  // Permission Seeding
  seedDefaultPermissions(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/permissions/seed/default`, {}, this.httpOptions)
      .pipe(tap(() => this.refreshPermissions()));
  }

  seedCustomPermissions(permissions: PermissionRequest[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/permissions/seed/custom`, { permissions }, this.httpOptions)
      .pipe(tap(() => this.refreshPermissions()));
  }

  getSeedingStatus(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/permissions/seed/status`, this.httpOptions);
  }

  // Utility Methods
  private refreshPermissions(): void {
    this.getAllPermissions().subscribe();
  }

  private refreshRoles(): void {
    this.getAllRoles().subscribe();
  }

  // Permission Matrix Operations
  createPermissionMatrix(roles: Role[], permissions: Permission[]): Observable<any[][]> {
    return new Observable(observer => {
      const matrix: any[][] = [];
      
      // Build matrix with role-permission assignments
      roles.forEach((role, roleIndex) => {
        this.getRolePermissions(role.id!).subscribe(rolePermissions => {
          const permissionIds = rolePermissions.map(rp => rp.permission.id);
          
          matrix[roleIndex] = permissions.map(permission => ({
            roleId: role.id,
            permissionId: permission.id,
            assigned: permissionIds.includes(permission.id),
            role: role,
            permission: permission
          }));

          if (matrix.length === roles.length) {
            observer.next(matrix);
            observer.complete();
          }
        });
      });
    });
  }

  updatePermissionMatrix(matrixChanges: any[]): Observable<any> {
    const bulkRequests: any[] = [];
    
    matrixChanges.forEach(change => {
      if (change.assigned) {
        bulkRequests.push({
          roleId: change.roleId,
          permissionId: change.permissionId,
          grantedBy: 'admin', // Should come from current user
          notes: 'Matrix update'
        });
      }
    });

    return this.http.post<any>(`${this.apiUrl}/role-permissions/bulk-matrix-update`, 
      { changes: bulkRequests }, this.httpOptions);
  }

  // Permission Categories and Resources
  getPermissionCategories(): Observable<string[]> {
    return this.getAllPermissions().pipe(
      map(permissions => {
        const categories = [...new Set(permissions.map(p => p.category).filter(c => c))];
        return categories.sort();
      })
    );
  }

  getPermissionResources(): Observable<string[]> {
    return this.getAllPermissions().pipe(
      map(permissions => {
        const resources = [...new Set(permissions.map(p => p.resource))];
        return resources.sort();
      })
    );
  }
}