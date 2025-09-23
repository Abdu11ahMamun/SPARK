import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const authenticated = auth.isAuthenticated();
  console.debug('[authGuard] state.url=', state.url, 'authenticated=', authenticated);
  if (authenticated) { return true; }
  const tree = router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  console.debug('[authGuard] Redirecting to /login with returnUrl', state.url);
  return tree;
};
