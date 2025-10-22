import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Permission, Role } from '../../core/models/permission.model';
import { PermissionService } from '../admin/services/permission.service';

interface UserProfile {
  id?: number;
  username: string;
  firstName?: string;
  lastName?: string;
  email: string;
  roles: string[];
  permissions?: string[];
  teamIds?: number[];
  teams?: { id: number; name: string; }[];
}

interface LoginResponse { 
  id?: number;
  username: string; 
  firstName?: string;
  lastName?: string;
  email: string;
  roles?: string[];
  teamIds?: number[];
  teams?: { id: number; name: string; }[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'basicAuthToken';
  private userKey = 'authUser';
  private profileKey = 'userProfile';
  
  private _username = signal<string | null>(null);
  private _userProfile = signal<UserProfile | null>(null);
  
  isAuthenticated = computed(() => !!this._username());
  userProfile = computed(() => this._userProfile());

  constructor(
    private http: HttpClient, 
    private router: Router,
    private permissionService: PermissionService
  ) {
    const stored = localStorage.getItem(this.tokenKey);
    const user = localStorage.getItem(this.userKey);
    const profile = localStorage.getItem(this.profileKey);
    
    if (stored && user) {
      this._username.set(user);
      if (profile) {
        try {
          this._userProfile.set(JSON.parse(profile));
        } catch (e) {
          console.warn('Invalid profile data in localStorage');
        }
      }
    } else {
      // For development - auto login as admin
      console.log('🔧 Development mode: auto-login as admin');
      this.devAutoLogin();
    }
  }

  private devAutoLogin(): void {
    // Check if there's a dev role preference in localStorage
    const devRole = localStorage.getItem('dev-role') || 'admin';
    
    let devUser: string;
    let devProfile: UserProfile;
    
    switch (devRole) {
      case 'developer':
        devUser = 'developer';
        devProfile = {
          id: 2,
          username: devUser,
          firstName: 'John',
          lastName: 'Developer',
          email: 'john.dev@spark.com',
          roles: ['USER', 'Developer'],
          permissions: ['dashboard:view', 'project:view', 'project:edit', 'task:create', 'task:edit'],
          teamIds: [2],
          teams: [{ id: 2, name: 'Development Team' }]
        };
        break;
      
      case 'manager':
        devUser = 'manager';
        devProfile = {
          id: 3,
          username: devUser,
          firstName: 'Jane',
          lastName: 'Manager',
          email: 'jane.manager@spark.com',
          roles: ['USER', 'Project Manager'],
          permissions: ['dashboard:view', 'project:view', 'project:edit', 'project:create', 'user:view', 'team:manage'],
          teamIds: [1, 2],
          teams: [{ id: 1, name: 'Management Team' }, { id: 2, name: 'Development Team' }]
        };
        break;
      
      default: // admin
        devUser = 'admin';
        devProfile = {
          id: 1,
          username: devUser,
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@spark.com',
          roles: ['ADMIN', 'Super Admin', 'USER'],
          permissions: ['*'], // Admin has all permissions
          teamIds: [1],
          teams: [{ id: 1, name: 'Admin Team' }]
        };
    }

    // Store auth data
    localStorage.setItem(this.tokenKey, btoa(`${devUser}:${devUser}`));
    localStorage.setItem(this.userKey, devUser);
    localStorage.setItem(this.profileKey, JSON.stringify(devProfile));
    
    this._username.set(devUser);
    this._userProfile.set(devProfile);
    
    console.log(`✅ Development auto-login complete as ${devUser}:`, devProfile.roles);
  }

  // Helper method to switch dev roles for testing
  switchDevRole(role: 'admin' | 'manager' | 'developer'): void {
    localStorage.setItem('dev-role', role);
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.profileKey);
    location.reload(); // Simple reload to trigger auto-login with new role
  }

  login(username: string, password: string) {
    const basic = btoa(`${username}:${password}`);
    const headers = new HttpHeaders({ 'Authorization': `Basic ${basic}` });
    
    return this.http.get<LoginResponse>(`${environment.apiUrl}/api/users/me`, { headers })
      .toPromise()
      .then(res => {
        if (!res) throw new Error('No response received');
        
        // Store basic auth data
        localStorage.setItem(this.tokenKey, basic);
        localStorage.setItem(this.userKey, username);
        this._username.set(username);
        
        // Create and store user profile
        const profile: UserProfile = {
          id: res.id,
          username: res.username || username,
          firstName: res.firstName,
          lastName: res.lastName,
          email: res.email || `${username}@company.com`, // fallback email
          roles: res.roles || ['USER'],
          teamIds: res.teamIds || [],
          teams: res.teams || []
        };
        
        localStorage.setItem(this.profileKey, JSON.stringify(profile));
        this._userProfile.set(profile);
        
        // Load user permissions after successful login
        this.loadUserPermissions().catch(error => {
          console.warn('Failed to load permissions after login:', error);
        });
        
        return true;
      })
      .catch(err => {
        throw err;
      });
  }

  getAuthHeader(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    return token ? `Basic ${token}` : null;
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.profileKey);
    this._username.set(null);
    this._userProfile.set(null);
    this.router.navigate(['/login']);
  }

  // Getter methods for easy access
  username() { return this._username(); }
  
  getUserFullName(): string {
    const profile = this._userProfile();
    if (!profile) return '';
    return `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.username;
  }
  
  getUserEmail(): string {
    return this._userProfile()?.email || '';
  }
  
  getUserRoles(): string[] {
    return this._userProfile()?.roles || [];
  }
  
  getUserTeams(): { id: number; name: string; }[] {
    // Ensure we always expose `name`
    return (this._userProfile()?.teams || []).map(t => ({ id: t.id, name: (t as any).name || (t as any).teamName }));
  }
  
  getUserTeamIds(): number[] {
    return this._userProfile()?.teamIds || [];
  }
  

  
  isInTeam(teamId: number): boolean {
    return this.getUserTeamIds().includes(teamId);
  }

  /**
   * Refresh teams for current logged-in user by calling backend teams endpoint.
   * Assumes we have a user id stored inside profile (extend if missing).
   */
  async refreshUserTeams(userId?: number) {
    const profile = this._userProfile();
    if (!profile) return;

    // If profile doesn't have id we cannot fetch teams yet
    // (Backend /api/users/me currently returns only username & role).
    // Optionally could add new endpoint to return id.
    const effectiveUserId = userId || (profile as any).id;
    if (!effectiveUserId) {
      return; // Cannot resolve id; skip silently
    }

    try {
      const teams = await this.http.get<any[]>(`${environment.apiUrl}/api/users/${effectiveUserId}/teams`).toPromise();
      if (teams) {
        // Normalize property name to `name` used in UI components
        const normalized = teams.map(t => ({
          id: t.id,
            // backend returns teamName
          name: t.teamName || t.name,
          teamName: t.teamName || t.name,
          description: t.description,
          status: t.status,
          pOwner: t.pOwner,
          sMaster: t.sMaster
        }));
        const updated = { ...profile, teams: normalized } as any;
        this._userProfile.set(updated);
        localStorage.setItem(this.profileKey, JSON.stringify(updated));
      }
    } catch (e) {
      console.error('Failed to refresh user teams', e);
    }
  }

  // RBAC Permission Methods
  hasPermission(permission: string): boolean {
    const profile = this._userProfile();
    if (!profile) return false;

    // Check direct permissions
    if (profile.permissions?.includes(permission)) {
      return true;
    }

    // Check role-based permissions (fallback if permissions not loaded)
    if (profile.roles?.includes('ADMIN')) {
      return true;
    }

    return false;
  }

  hasRole(role: string): boolean {
    const profile = this._userProfile();
    return profile?.roles?.includes(role) || false;
  }

  hasAnyRole(roles: string[]): boolean {
    const profile = this._userProfile();
    if (!profile?.roles) return false;
    return roles.some(role => profile.roles.includes(role));
  }

  hasAllRoles(roles: string[]): boolean {
    const profile = this._userProfile();
    if (!profile?.roles) return false;
    return roles.every(role => profile.roles.includes(role));
  }

  checkAccess(requiredPermissions: string[], requireAll: boolean = false): boolean {
    if (requireAll) {
      return requiredPermissions.every(permission => this.hasPermission(permission));
    } else {
      return requiredPermissions.some(permission => this.hasPermission(permission));
    }
  }

  async loadUserPermissions(): Promise<void> {
    const profile = this._userProfile();
    if (!profile?.id) return;

    try {
      // TODO: Implement getUserPermissions API endpoint in backend
      // For now, using mock permissions based on user roles
      const permissions = this.getMockPermissionsForUser(profile);
      const updatedProfile = { ...profile, permissions };
      this._userProfile.set(updatedProfile);
      localStorage.setItem(this.profileKey, JSON.stringify(updatedProfile));
    } catch (error) {
      console.error('Failed to load user permissions:', error);
    }
  }

  getPermissionsByGroup(group: string): string[] {
    const profile = this._userProfile();
    if (!profile?.permissions) return [];
    
    return profile.permissions.filter(permission => 
      permission.startsWith(`${group}:`) || permission.startsWith(`${group}_`)
    );
  }

  canAccessModule(module: string): boolean {
    const modulePermissions = [
      `${module}:read`,
      `${module}:view`,
      `${module}_read`,
      `${module}_view`
    ];
    return this.hasAnyRole(['ADMIN']) || this.checkAccess(modulePermissions);
  }

  canModifyModule(module: string): boolean {
    const modifyPermissions = [
      `${module}:write`,
      `${module}:update`,
      `${module}:create`,
      `${module}_write`,
      `${module}_update`,
      `${module}_create`
    ];
    return this.hasAnyRole(['ADMIN']) || this.checkAccess(modifyPermissions);
  }

  private getMockPermissionsForUser(profile: UserProfile): string[] {
    // Mock permissions based on user roles using the actual permission codes from the API
    const rolePermissions: { [key: string]: string[] } = {
      'ADMIN': [
        // Dashboard
        'DASHBOARD_VIEW',
        // User Management
        'USER_VIEW', 'USER_CREATE', 'USER_EDIT', 'USER_DELETE',
        // Role Management  
        'ROLE_VIEW', 'ROLE_CREATE', 'ROLE_EDIT', 'ROLE_DELETE',
        // Team Management
        'TEAM_VIEW', 'TEAM_CREATE', 'TEAM_EDIT', 'TEAM_DELETE',
        // Project Management
        'PROJECT_VIEW', 'PROJECT_CREATE', 'PROJECT_EDIT', 'PROJECT_DELETE',
        // Module Management
        'MODULE_VIEW', 'MODULE_CREATE', 'MODULE_EDIT', 'MODULE_DELETE',
        // Task Management
        'TASK_VIEW', 'TASK_CREATE', 'TASK_EDIT', 'TASK_DELETE',
        // Sprint Management
        'SPRINT_VIEW', 'SPRINT_CREATE', 'SPRINT_EDIT', 'SPRINT_DELETE',
        // Backlog Management
        'BACKLOG_VIEW', 'BACKLOG_CREATE', 'BACKLOG_EDIT', 'BACKLOG_DELETE',
        // Client Management
        'CLIENT_VIEW', 'CLIENT_CREATE', 'CLIENT_EDIT', 'CLIENT_DELETE',
        // Job Types
        'JOB_TYPE_VIEW', 'JOB_TYPE_CREATE', 'JOB_TYPE_EDIT', 'JOB_TYPE_DELETE',
        // Document Management
        'DOCUMENT_VIEW', 'DOCUMENT_CREATE', 'DOCUMENT_EDIT', 'DOCUMENT_DELETE',
        // Reports
        'REPORT_VIEW', 'REPORT_CREATE',
        // System Admin
        'SYSTEM_ADMIN'
      ],
      'MANAGER': [
        'DASHBOARD_VIEW', 'USER_VIEW', 'TEAM_VIEW', 'TEAM_EDIT', 
        'PROJECT_VIEW', 'PROJECT_CREATE', 'PROJECT_EDIT',
        'TASK_VIEW', 'TASK_CREATE', 'TASK_EDIT', 'TASK_DELETE',
        'SPRINT_VIEW', 'SPRINT_CREATE', 'SPRINT_EDIT',
        'BACKLOG_VIEW', 'BACKLOG_CREATE', 'BACKLOG_EDIT',
        'REPORT_VIEW', 'REPORT_CREATE'
      ],
      'Project Manager': [
        'DASHBOARD_VIEW', 'PROJECT_VIEW', 'PROJECT_EDIT', 
        'TASK_VIEW', 'TASK_CREATE', 'TASK_EDIT',
        'TEAM_VIEW', 'USER_VIEW'
      ],
      'DEVELOPER': [
        'DASHBOARD_VIEW', 'TASK_VIEW', 'TASK_EDIT',
        'PROJECT_VIEW', 'TEAM_VIEW', 'BACKLOG_VIEW'
      ],
      'Developer': [
        'DASHBOARD_VIEW', 'TASK_VIEW', 'TASK_EDIT',
        'PROJECT_VIEW', 'TEAM_VIEW', 'BACKLOG_VIEW'
      ],
      'USER': [
        'DASHBOARD_VIEW', 'TASK_VIEW'
      ]
    };

    const allPermissions: string[] = [];
    profile.roles.forEach(role => {
      const permissions = rolePermissions[role] || [];
      allPermissions.push(...permissions);
    });

    // Remove duplicates and return
    return [...new Set(allPermissions)];
  }
}
