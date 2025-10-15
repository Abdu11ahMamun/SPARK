import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Guard to check if user is authenticated
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> | Promise<boolean> {
    
    if (this.authService.isAuthenticated()) {
      return true;
    }

    // Redirect to login page
    this.router.navigate(['/login'], { 
      queryParams: { returnUrl: state.url } 
    });
    return false;
  }
}

/**
 * Guard to check if user has required permissions
 */
@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> | Promise<boolean> {

    // First check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: state.url } 
      });
      return false;
    }

    // Get required permissions from route data
    const requiredPermissions: string[] = route.data['permissions'] || [];
    const requiredRoles: string[] = route.data['roles'] || [];

    // If no permissions or roles required, allow access
    if (requiredPermissions.length === 0 && requiredRoles.length === 0) {
      return true;
    }

    // Check permissions
    if (requiredPermissions.length > 0) {
      const hasPermission = this.authService.hasAnyPermission(requiredPermissions);
      if (!hasPermission) {
        this.router.navigate(['/unauthorized']);
        return false;
      }
    }

    // Check roles
    if (requiredRoles.length > 0) {
      const hasRole = this.authService.hasAnyRole(requiredRoles);
      if (!hasRole) {
        this.router.navigate(['/unauthorized']);
        return false;
      }
    }

    return true;
  }
}

/**
 * Guard to check if user has admin access
 */
@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> | Promise<boolean> {

    // First check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: state.url } 
      });
      return false;
    }

    // Check if user has admin access permission
    if (this.authService.hasPermission('Admin', 'access') || 
        this.authService.hasRole('Super Admin') || 
        this.authService.hasRole('Admin')) {
      return true;
    }

    // Redirect to unauthorized page
    this.router.navigate(['/unauthorized']);
    return false;
  }
}

/**
 * Guard for role-based access
 */
@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> | Promise<boolean> {

    // First check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: state.url } 
      });
      return false;
    }

    // Get required roles from route data
    const requiredRoles: string[] = route.data['roles'] || [];

    // If no roles required, allow access
    if (requiredRoles.length === 0) {
      return true;
    }

    // Check if user has any of the required roles
    const hasRole = this.authService.hasAnyRole(requiredRoles);
    if (hasRole) {
      return true;
    }

    // Redirect to unauthorized page
    this.router.navigate(['/unauthorized']);
    return false;
  }
}

/**
 * Guard for resource-specific permissions
 */
@Injectable({
  providedIn: 'root'
})
export class ResourceGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> | Promise<boolean> {

    // First check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: state.url } 
      });
      return false;
    }

    // Get resource and action from route data
    const resource: string = route.data['resource'];
    const action: string = route.data['action'];

    if (!resource || !action) {
      console.error('ResourceGuard: resource and action must be specified in route data');
      return false;
    }

    // Check if user has the required permission
    const hasPermission = this.authService.hasPermission(resource, action);
    if (hasPermission) {
      return true;
    }

    // Redirect to unauthorized page
    this.router.navigate(['/unauthorized']);
    return false;
  }
}