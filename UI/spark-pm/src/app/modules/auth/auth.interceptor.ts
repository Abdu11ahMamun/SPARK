import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const authHeader = auth.getAuthHeader();
  if (authHeader) {
    req = req.clone({ setHeaders: { Authorization: authHeader } });
  }
  return next(req);
};
