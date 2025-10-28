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
  loginTime?: number; // Timestamp when user logged in
  lastActivity?: number; // Timestamp of last user activity
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
  private sessionTimeoutKey = 'sessionTimeout';
  
  // Session configuration (in milliseconds)
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private readonly INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes of inactivity
  private readonly SESSION_CHECK_INTERVAL = 60 * 1000; // Check every minute
  
  private _username = signal<string | null>(null);
  private _userProfile = signal<UserProfile | null>(null);
  private sessionCheckInterval: any;
  
  isAuthenticated = computed(() => {
    const hasUser = !!this._username();
    const isSessionValid = this.isSessionValid();
    return hasUser && isSessionValid;
  });
  userProfile = computed(() => this._userProfile());

  constructor(
    private http: HttpClient, 
    private router: Router,
    private permissionService: PermissionService
  ) {
    this.initializeAuth();
    this.startSessionMonitoring();
    this.setupActivityTracking();
  }

  private initializeAuth(): void {
    const stored = localStorage.getItem(this.tokenKey);
    const user = localStorage.getItem(this.userKey);
    const profile = localStorage.getItem(this.profileKey);
    
    if (stored && user && this.isSessionValid()) {
      this._username.set(user);
      if (profile) {
        try {
          const parsedProfile = JSON.parse(profile);
          // Update last activity to current time
          parsedProfile.lastActivity = Date.now();
          this._userProfile.set(parsedProfile);
          this.saveSession(parsedProfile);
        } catch (e) {
          console.warn('Invalid profile data in localStorage');
          this.clearSession();
        }
      }
    } else if (stored || user || profile) {
      // Clear invalid/expired session
      console.log('🔐 Session expired or invalid, clearing auth data');
      this.clearSession();
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
    this.logout();
  }

  // Helper method to create test accounts for login testing
  createTestUser(username: string, role: 'admin' | 'manager' | 'developer' = 'admin'): { username: string; password: string } {
    // For testing purposes - return credentials that work with mock login
    return { username, password: username };
  }

  // Get session info for debugging
  getSessionInfo(): any {
    const profile = this._userProfile();
    if (!profile) return null;

    const now = Date.now();
    return {
      username: profile.username,
      loginTime: profile.loginTime,
      lastActivity: profile.lastActivity,
      sessionAge: profile.loginTime ? now - profile.loginTime : 0,
      inactivityTime: profile.lastActivity ? now - profile.lastActivity : 0,
      isValid: this.isSessionValid(),
      timeUntilExpiry: profile.loginTime ? this.SESSION_TIMEOUT - (now - profile.loginTime) : 0
    };
  }

  private startSessionMonitoring(): void {
    // Clear any existing interval
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }
    
    // Check session validity every minute
    this.sessionCheckInterval = setInterval(() => {
      if (!this.isSessionValid()) {
        console.log('🔐 Session expired, logging out');
        this.logout();
      } else {
        this.checkSessionWarning();
      }
    }, this.SESSION_CHECK_INTERVAL);
  }

  private checkSessionWarning(): void {
    const profile = this._userProfile();
    if (!profile || !profile.loginTime) return;

    const now = Date.now();
    const sessionAge = now - profile.loginTime;
    const timeUntilExpiry = this.SESSION_TIMEOUT - sessionAge;
    
    // Warn when 5 minutes remaining
    if (timeUntilExpiry <= 5 * 60 * 1000 && timeUntilExpiry > 4 * 60 * 1000) {
      console.warn('⚠️ Session will expire in 5 minutes');
      // You can add a notification service call here
    }
  }

  private setupActivityTracking(): void {
    // Track user activity to update lastActivity timestamp
    const activityEvents = ['click', 'keypress', 'scroll', 'mousemove'];
    
    activityEvents.forEach(event => {
      document.addEventListener(event, () => {
        this.updateLastActivity();
      }, { passive: true });
    });
  }

  private updateLastActivity(): void {
    const profile = this._userProfile();
    if (profile) {
      const now = Date.now();
      // Only update if more than 30 seconds have passed (avoid too frequent updates)
      if (!profile.lastActivity || now - profile.lastActivity > 30000) {
        profile.lastActivity = now;
        this._userProfile.set({ ...profile });
        this.saveSession(profile);
      }
    }
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem(this.tokenKey);
    const username = localStorage.getItem(this.userKey);
    const profile = this._userProfile();
    
    // Check if we have basic auth data
    const hasAuthData = !!(token && username);
    
    // Check if session is still valid (not expired)
    const hasValidSession = profile ? this.isSessionValid() : false;
    
    return hasAuthData && hasValidSession;
  }

  getUserProfile(): UserProfile | null {
    return this._userProfile();
  }

  private handleSessionExpiry(): void {
    console.log('🔐 Session expired, clearing data and redirecting to login');
    this.clearSession();
    this.router.navigate(['/login']);
  }

  private isSessionValid(): boolean {
    const profile = this._userProfile();
    if (!profile || !profile.loginTime) {
      return false;
    }

    const now = Date.now();
    const sessionAge = now - profile.loginTime;
    const inactivityTime = profile.lastActivity ? now - profile.lastActivity : sessionAge;

    // Check if session has expired due to time limit
    if (sessionAge > this.SESSION_TIMEOUT) {
      console.debug('🔐 Session expired due to timeout:', sessionAge / 60000, 'minutes');
      return false;
    }

    // Check if session has expired due to inactivity
    if (inactivityTime > this.INACTIVITY_TIMEOUT) {
      console.debug('🔐 Session expired due to inactivity:', inactivityTime / 60000, 'minutes');
      return false;
    }

    return true;
  }

  private saveSession(profile: UserProfile): void {
    localStorage.setItem(this.profileKey, JSON.stringify(profile));
    localStorage.setItem(this.sessionTimeoutKey, (profile.loginTime! + this.SESSION_TIMEOUT).toString());
  }

  private clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.profileKey);
    localStorage.removeItem(this.sessionTimeoutKey);
    this._username.set(null);
    this._userProfile.set(null);
  }

  refreshSession(): void {
    const profile = this._userProfile();
    if (profile) {
      const now = Date.now();
      profile.lastActivity = now;
      // Optionally extend login time for active users
      if (profile.loginTime && (now - profile.loginTime) > (this.SESSION_TIMEOUT * 0.75)) {
        profile.loginTime = now - (this.SESSION_TIMEOUT * 0.25); // Give 75% more time
        console.log('🔄 Session refreshed due to continued activity');
      }
      this._userProfile.set({ ...profile });
      this.saveSession(profile);
    }
  }

  login(username: string, password: string) {
    const loginRequest = { username, password };
    
    return this.http.post<any>(`${environment.apiUrl}/api/auth/login`, loginRequest)
      .toPromise()
      .then(res => {
        if (!res || !res.sessionToken) throw new Error('No session token received');
        
        console.log('🔐 Login successful, received session token');
        
        // Store session token (Bearer format for API calls)
        localStorage.setItem(this.tokenKey, res.sessionToken);
        localStorage.setItem(this.userKey, res.user.username);
        this._username.set(res.user.username);
        
        // Create user profile with session timestamps and server data
        const now = Date.now();
        const profile: UserProfile = {
          id: res.user.id,
          username: res.user.username,
          firstName: res.user.displayName?.split(' ')[0] || res.user.username,
          lastName: res.user.displayName?.split(' ')[1] || '',
          email: res.user.email || `${username}@company.com`,
          roles: Array.from(res.roles || ['USER']),
          permissions: Array.from(res.permissions || []),
          teamIds: [],
          teams: [],
          loginTime: now,
          lastActivity: now
        };
        
        this.saveSession(profile);
        this._userProfile.set(profile);
        
        console.log('✅ Session established with', res.permissions?.size || 0, 'permissions');
        return true;
      })
      .catch(err => {
        console.error('🔐 Login failed:', err);
        throw err;
      });
  }

  getAuthHeader(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    return token ? `Bearer ${token}` : null;
  }

  logout() {
    // Clear session monitoring
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }
    
    // Call backend logout if we have a session
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      this.http.post(`${environment.apiUrl}/api/auth/logout`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).subscribe({
        next: () => console.log('🔐 Backend session invalidated'),
        error: (err) => console.warn('Failed to invalidate backend session:', err)
      });
    }
    
    // Clear all session data
    this.clearSession();
    
    console.log('🔐 User logged out');
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

  getAllPermissions(): string[] {
    const profile = this._userProfile();
    return profile?.permissions || [];
  }

  // Convenience wrapper (alias) for readability in some consumers
  getPermissions(): string[] { return this.getAllPermissions(); }

  hasAny(permissions: string[]): boolean {
    const perms = this.getAllPermissions();
    if (perms.includes('*')) return true;
    return permissions.some(p => this.hasPermission(p));
  }

  hasAll(permissions: string[]): boolean {
    const perms = this.getAllPermissions();
    if (perms.includes('*')) return true;
    return permissions.every(p => this.hasPermission(p));
  }

  /**
   * Determine the first accessible app route path for the current user.
   * Used for initial redirect after login or root navigation.
   * Order priority mirrors main navigation layout.
   */
  firstAccessiblePath(): string {
    // If wildcard, default to dashboard root
    const perms = this.getAllPermissions();
    if (perms.includes('*')) return '/';

    const ordered: { path: string; any: string[]; all?: string[] }[] = [
      { path: '/dashboard', any: ['DASHBOARD_VIEW'] },
      { path: '/my-tasks', any: ['TASK_VIEW'] },
      { path: '/backlog', any: ['BACKLOG_VIEW','TASK_VIEW'] },
      { path: '/sprints', any: ['SPRINT_VIEW','TASK_VIEW'] },
      { path: '/teams', any: ['TEAM_VIEW'] },
      { path: '/users', any: ['USER_VIEW'] },
      { path: '/products', any: ['PROJECT_VIEW','MODULE_VIEW','PRODUCT_VIEW'] },
      { path: '/product-modules', any: ['MODULE_VIEW'] },
      { path: '/roles', any: ['ROLE_VIEW'] },
      { path: '/permissions', any: ['SYSTEM_ADMIN','ROLE_VIEW','USER_VIEW'] },
      { path: '/task-types', any: ['TASK_VIEW'] }
    ];

    for (const entry of ordered) {
      const allowed = this.hasAny(entry.any) && (!entry.all || this.hasAll(entry.all));
      if (allowed) return entry.path;
    }
    // Fallback if nothing matched and user is authenticated
    return '/unauthorized';
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
    if (!profile) {
      console.debug('[hasPermission] No profile', permission);
      return false;
    }

    // Check direct permissions (including wildcard *)
    if (profile.permissions?.includes(permission) || profile.permissions?.includes('*')) {
      console.debug('[hasPermission] Permission granted via direct/wildcard', permission, profile.permissions);
      return true;
    }

    // Check role-based permissions (fallback if permissions not loaded)
    if (profile.roles?.includes('ADMIN')) {
      console.debug('[hasPermission] Permission granted via ADMIN role', permission);
      return true;
    }

    console.debug('[hasPermission] Permission denied', permission, 'user permissions:', profile.permissions, 'roles:', profile.roles);
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

  validateSession(): Observable<boolean> {
    if (!this.isLoggedIn()) {
      console.log('🚫 No active session found');
      return of(false);
    }

    // First check local session expiry for quick validation
    const profile = this.getUserProfile();
    if (profile && profile.loginTime && profile.lastActivity) {
      const now = Date.now();
      const sessionAge = now - profile.loginTime;
      const timeSinceActivity = now - profile.lastActivity;

      if (sessionAge > this.SESSION_TIMEOUT || timeSinceActivity > this.INACTIVITY_TIMEOUT) {
        console.log('⏰ Local session validation failed');
        this.handleSessionExpiry();
        return of(false);
      }
    }

    // Validate with backend
    const token = localStorage.getItem(this.tokenKey);
    if (!token) {
      return of(false);
    }

    return this.http.get<any>(`${environment.apiUrl}/api/auth/validate`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      map((response) => {
        if (response.valid) {
          console.log('✅ Backend session validation successful');
          // Update last activity time
          this.updateLastActivity();
          return true;
        } else {
          console.log('🚫 Backend session validation failed');
          this.handleSessionExpiry();
          return false;
        }
      }),
      catchError((error) => {
        console.error('❌ Session validation error:', error);
        this.handleSessionExpiry();
        return of(false);
      })
    );
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
    // If user already has wildcard permission, keep it
    if (profile.permissions?.includes('*')) {
      return ['*'];
    }
    
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
