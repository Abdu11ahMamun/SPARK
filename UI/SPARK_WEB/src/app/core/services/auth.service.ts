import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// User interface
export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: Role[];
  permissions: string[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt?: Date;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresIn: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {
    this.loadStoredUser();
  }

  /**
   * Load user from localStorage if available
   */
  private loadStoredUser(): void {
    try {
      const storedUser = localStorage.getItem('currentUser');
      const token = localStorage.getItem('authToken');
      
      if (storedUser && token) {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
        
        // Check if token is expired (optional)
        const expiryTime = localStorage.getItem('tokenExpiry');
        if (expiryTime && new Date().getTime() > parseInt(expiryTime)) {
          this.logout();
        }
      } else {
        // For development, create a mock user
        this.createMockUser();
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
      this.createMockUser();
    }
  }

  /**
   * Create mock user for development
   */
  private createMockUser(): void {
    const mockUser: User = {
      id: 1,
      username: 'admin',
      email: 'admin@spark.com',
      firstName: 'System',
      lastName: 'Administrator',
      roles: [
        {
          id: 1,
          name: 'Super Admin',
          description: 'Full system access',
          permissions: [
            { id: 1, name: 'View Dashboard', resource: 'Dashboard', action: 'view' },
            { id: 2, name: 'Edit Dashboard', resource: 'Dashboard', action: 'edit' },
            { id: 3, name: 'View Users', resource: 'Users', action: 'view' },
            { id: 4, name: 'Create User', resource: 'Users', action: 'create' },
            { id: 5, name: 'Edit User', resource: 'Users', action: 'edit' },
            { id: 6, name: 'Delete User', resource: 'Users', action: 'delete' },
            { id: 7, name: 'View Roles', resource: 'Roles', action: 'view' },
            { id: 8, name: 'Manage Roles', resource: 'Roles', action: 'manage' },
            { id: 19, name: 'Admin Access', resource: 'Admin', action: 'access' },
            { id: 20, name: 'System Settings', resource: 'Admin', action: 'settings' }
          ]
        }
      ],
      permissions: [
        'Dashboard:view', 'Dashboard:edit',
        'Users:view', 'Users:create', 'Users:edit', 'Users:delete',
        'Roles:view', 'Roles:manage',
        'Admin:access', 'Admin:settings'
      ],
      isActive: true,
      lastLogin: new Date(),
      createdAt: new Date()
    };

    this.currentUserSubject.next(mockUser);
    this.isAuthenticatedSubject.next(true);
    
    // Store mock user in localStorage
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    localStorage.setItem('authToken', 'mock-jwt-token');
    localStorage.setItem('tokenExpiry', (new Date().getTime() + 24 * 60 * 60 * 1000).toString()); // 24 hours
  }

  /**
   * Login user
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    // For development, simulate login
    if (credentials.username === 'admin' && credentials.password === 'admin') {
      const mockResponse: LoginResponse = {
        user: this.currentUserSubject.value!,
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 24 * 60 * 60 * 1000 // 24 hours
      };
      
      localStorage.setItem('currentUser', JSON.stringify(mockResponse.user));
      localStorage.setItem('authToken', mockResponse.token);
      localStorage.setItem('tokenExpiry', (new Date().getTime() + mockResponse.expiresIn).toString());
      
      return of(mockResponse);
    }

    // Real implementation would be:
    // return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, credentials, this.httpOptions)
    //   .pipe(
    //     tap(response => {
    //       this.currentUserSubject.next(response.user);
    //       this.isAuthenticatedSubject.next(true);
    //       localStorage.setItem('currentUser', JSON.stringify(response.user));
    //       localStorage.setItem('authToken', response.token);
    //       localStorage.setItem('tokenExpiry', (new Date().getTime() + response.expiresIn).toString());
    //     }),
    //     catchError(error => {
    //       console.error('Login error:', error);
    //       throw error;
    //     })
    //   );

    return of().pipe(
      map(() => {
        throw new Error('Invalid credentials');
      })
    );
  }

  /**
   * Logout user
   */
  logout(): void {
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenExpiry');
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(resource: string, action: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    const permissionKey = `${resource}:${action}`;
    return user.permissions.includes(permissionKey);
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(permissions: string[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    return permissions.some(permission => user.permissions.includes(permission));
  }

  /**
   * Check if user has specific role
   */
  hasRole(roleName: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    return user.roles.some(role => role.name === roleName);
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roleNames: string[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    return roleNames.some(roleName => 
      user.roles.some(role => role.name === roleName)
    );
  }

  /**
   * Get user roles
   */
  getUserRoles(): Role[] {
    const user = this.getCurrentUser();
    return user ? user.roles : [];
  }

  /**
   * Get user permissions
   */
  getUserPermissions(): string[] {
    const user = this.getCurrentUser();
    return user ? user.permissions : [];
  }

  /**
   * Refresh user data
   */
  refreshUser(): Observable<User> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    // For development, return current user
    return of(currentUser);

    // Real implementation would be:
    // return this.http.get<User>(`${this.baseUrl}/auth/me`, this.getAuthHeaders())
    //   .pipe(
    //     tap(user => {
    //       this.currentUserSubject.next(user);
    //       localStorage.setItem('currentUser', JSON.stringify(user));
    //     })
    //   );
  }

  /**
   * Get authentication headers
   */
  getAuthHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('authToken');
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
  }
}