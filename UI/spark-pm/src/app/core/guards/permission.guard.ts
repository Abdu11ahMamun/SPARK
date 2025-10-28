import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../modules/auth/auth.service';

// Route guard checking requiredPermissions declared in route data.
export const permissionGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const required: string[] = route.data['requiredPermissions'] || [];
  const requireAll: boolean = route.data['requireAll'] || false;
  if (!required.length) return true; // No specific permissions required

  // Admin wildcard support
  const perms = auth.getAllPermissions();
  if (perms.includes('*')) return true;

  const allowed = requireAll
    ? required.every(p => auth.hasPermission(p))
    : required.some(p => auth.hasPermission(p));

  if (!allowed) return router.parseUrl('/unauthorized');
  return true;
};
