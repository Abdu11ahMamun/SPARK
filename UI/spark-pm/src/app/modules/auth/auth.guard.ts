import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const authenticated = auth.isAuthenticated();
  console.debug('[authGuard] state.url=', state.url, 'authenticated=', authenticated);
  
  if (authenticated) { 
    // Update activity on route access
    auth.refreshSession();
    return true; 
  }
  
  // Session invalid or expired, redirect to login
  console.log('🔐 Access denied - session invalid, redirecting to login');
  const tree = router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  return tree;
};
